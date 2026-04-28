import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { MultiSelect } from 'primereact/multiselect';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

const ROLES_OPCIONES = [
  { label: 'Dueño',      value: 'ROLE_DUENO' },
  { label: 'Secretaria', value: 'ROLE_SECRETARIA' },
  { label: 'Entrenador', value: 'ROLE_ENTRENADOR' },
];

const ROL_LABEL = {
  ROLE_DUENO:      { label: 'Dueño',      severity: 'danger' },
  ROLE_SECRETARIA: { label: 'Secretaria', severity: 'info' },
  ROLE_ENTRENADOR: { label: 'Entrenador', severity: 'success' },
};

const empty = { nombre: '', email: '', password: '', activo: true, roles: [] };

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [dialog,   setDialog]   = useState(false);
  const [form,     setForm]     = useState(empty);
  const [esEditar, setEsEditar] = useState(false);
  const toast = useRef(null);

  const cargar = async () => {
    setLoading(true);
    const { data } = await api.get('/usuarios');
    // roles viene como Set del backend → convertir a array para el frontend
    const usuarios = data.map(u => ({ ...u, roles: Array.from(u.roles || []) }));
    setUsuarios(usuarios);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const abrirNuevo = () => {
    setForm(empty);
    setEsEditar(false);
    setDialog(true);
  };

  const abrirEditar = (u) => {
    setForm({ ...u, password: '', roles: Array.from(u.roles || []) });
    setEsEditar(true);
    setDialog(true);
  };

  const guardar = async () => {
    try {
      // IMPORTANTE: roles debe ser un array, no un Set
      // JSON.stringify convierte Set a {} (vacío), por eso mandamos array directamente
      const payload = {
        nombre:   form.nombre,
        email:    form.email,
        password: form.password,
        activo:   form.activo,
        roles:    Array.isArray(form.roles) ? form.roles : Array.from(form.roles),
      };

      if (esEditar) {
        await api.put(`/usuarios/${form.id}`, payload);
      } else {
        await api.post('/usuarios', payload);
      }

      toast.current.show({ severity: 'success', summary: 'Guardado', detail: 'Usuario guardado correctamente' });
      setDialog(false);
      cargar();
    } catch (e) {
      const msg = e.response?.data || 'No se pudo guardar el usuario';
      toast.current.show({ severity: 'error', summary: 'Error', detail: msg });
    }
  };

  const desactivar = (u) => {
    confirmDialog({
      message: `¿Desactivar a ${u.nombre}?`,
      header:  'Confirmar',
      icon:    'pi pi-exclamation-triangle',
      accept:  async () => {
        await api.delete(`/usuarios/${u.id}`);
        toast.current.show({ severity: 'info', summary: 'Usuario desactivado' });
        cargar();
      },
    });
  };

  const rolesBody = (row) => (
    <div className="flex gap-1 flex-wrap">
      {(row.roles || []).map((r) => (
        <Tag key={r} value={ROL_LABEL[r]?.label ?? r} severity={ROL_LABEL[r]?.severity ?? 'secondary'} />
      ))}
    </div>
  );

  const accionesBody = (row) => (
    <div className="flex gap-1">
      <Button icon="pi pi-pencil" text rounded severity="secondary" onClick={() => abrirEditar(row)} />
      {row.activo && (
        <Button icon="pi pi-times" text rounded severity="danger" onClick={() => desactivar(row)} />
      )}
    </div>
  );

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="page-header mb-3">
        <div>
          <h2 className="m-0">Usuarios</h2>
          <p className="page-subtitle m-0">Administración de accesos y roles.</p>
        </div>
        <Button label="Nuevo usuario" icon="pi pi-user-plus" onClick={abrirNuevo} />
      </div>

      <DataTable value={usuarios} loading={loading} stripedRows
        emptyMessage="No hay usuarios registrados"
        responsiveLayout="scroll" size="small">
        <Column field="nombre" header="Nombre"   sortable />
        <Column field="email"  header="Correo"   sortable />
        <Column header="Roles" body={rolesBody} />
        <Column field="activo" header="Estado"
          body={(r) => <Tag value={r.activo ? 'Activo' : 'Inactivo'}
                            severity={r.activo ? 'success' : 'danger'} />} />
        <Column header="Acciones" body={accionesBody} style={{ width: '8rem' }} />
      </DataTable>

      <Dialog visible={dialog} onHide={() => setDialog(false)}
        header={esEditar ? 'Editar usuario' : 'Nuevo usuario'}
        style={{ width: '30rem', maxWidth: '95vw' }}
        breakpoints={{ '960px': '75vw', '640px': '95vw' }}>
        <div className="flex flex-column gap-3 pt-2">

          <div className="flex flex-column gap-1">
            <label className="font-medium">Nombre completo</label>
            <InputText value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              className="w-full" />
          </div>

          <div className="flex flex-column gap-1">
            <label className="font-medium">Correo</label>
            <InputText value={form.email} disabled={esEditar}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full" />
          </div>

          <div className="flex flex-column gap-1">
            <label className="font-medium">
              {esEditar ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
            </label>
            <Password value={form.password} feedback={false} toggleMask
              className="w-full" inputClassName="w-full"
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          </div>

          <div className="flex flex-column gap-1">
            <label className="font-medium">Roles</label>
            <MultiSelect
              value={form.roles}
              options={ROLES_OPCIONES}
              onChange={(e) => setForm((f) => ({ ...f, roles: e.value }))}
              placeholder="Seleccionar roles"
              className="w-full"
              display="chip"
            />
          </div>

          <Button label="Guardar" icon="pi pi-save" onClick={guardar} />
        </div>
      </Dialog>
    </div>
  );
}

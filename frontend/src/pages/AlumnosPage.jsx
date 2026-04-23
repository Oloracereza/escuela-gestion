import { useState, useEffect, useRef } from 'react';
import { alumnosApi } from '../services/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

const empty = { nombre: '', apellido: '', email: '', telefono: '', activo: true };

export default function AlumnosPage() {
  const [alumnos, setAlumnos]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [dialog,  setDialog]    = useState(false);
  const [form,    setForm]      = useState(empty);
  const toast = useRef(null);

  const cargar = async () => {
    setLoading(true);
    const { data } = await alumnosApi.listar();
    setAlumnos(data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async () => {
    try {
      if (form.id) await alumnosApi.actualizar(form.id, form);
      else         await alumnosApi.crear(form);
      toast.current.show({ severity: 'success', summary: 'Guardado', detail: 'Alumno guardado correctamente' });
      setDialog(false);
      cargar();
    } catch {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el alumno' });
    }
  };

  const desactivar = (alumno) => {
    confirmDialog({
      message:  `¿Desactivar a ${alumno.nombre} ${alumno.apellido}?`,
      header:   'Confirmar',
      icon:     'pi pi-exclamation-triangle',
      accept:   async () => {
        await alumnosApi.desactivar(alumno.id);
        toast.current.show({ severity: 'info', summary: 'Alumno desactivado' });
        cargar();
      },
    });
  };

  const acciones = (row) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" text rounded severity="secondary"
        onClick={() => { setForm(row); setDialog(true); }} />
      {row.activo && (
        <Button icon="pi pi-times" text rounded severity="danger"
          onClick={() => desactivar(row)} />
      )}
    </div>
  );

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Alumnos</h2>
        <Button label="Nuevo alumno" icon="pi pi-plus"
          onClick={() => { setForm(empty); setDialog(true); }} />
      </div>

      <DataTable value={alumnos} loading={loading} paginator rows={10}
        stripedRows emptyMessage="No hay alumnos registrados">
        <Column field="nombre"      header="Nombre"   sortable />
        <Column field="apellido"    header="Apellido" sortable />
        <Column field="email"       header="Correo" />
        <Column field="telefono"    header="Teléfono" />
        <Column field="grupoNombre" header="Grupo" />
        <Column field="activo" header="Estado"
          body={(r) => <Tag value={r.activo ? 'Activo' : 'Inactivo'}
                            severity={r.activo ? 'success' : 'danger'} />} />
        <Column header="Acciones" body={acciones} style={{ width: '8rem' }} />
      </DataTable>

      <Dialog visible={dialog} onHide={() => setDialog(false)}
        header={form.id ? 'Editar alumno' : 'Nuevo alumno'} style={{ width: '30rem' }}>
        <div className="flex flex-column gap-3 pt-2">
          {['nombre', 'apellido', 'email', 'telefono'].map((field) => (
            <div key={field} className="flex flex-column gap-1">
              <label className="font-medium capitalize">{field}</label>
              <InputText
                value={form[field] || ''}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              />
            </div>
          ))}
          <Button label="Guardar" icon="pi pi-save" onClick={guardar} />
        </div>
      </Dialog>
    </div>
  );
}

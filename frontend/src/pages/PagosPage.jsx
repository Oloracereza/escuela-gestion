import { useState, useEffect, useRef } from 'react';
import { pagosApi, alumnosApi } from '../services/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';

const METODOS = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'];
const MESES   = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const METODO_SEVERITY = { EFECTIVO: 'success', TRANSFERENCIA: 'info', TARJETA: 'warning' };

const empty = {
  alumnoId:          null,
  monto:             null,
  fechaPago:         new Date(),
  mesCorrespondiente: '',
  metodoPago:        'EFECTIVO',
  concepto:          '',
};

export default function PagosPage() {
  const [pagos,   setPagos]   = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog,  setDialog]  = useState(false);
  const [form,    setForm]    = useState(empty);
  const toast = useRef(null);

  const cargar = async () => {
    setLoading(true);
    const [p, a] = await Promise.all([pagosApi.listar(), alumnosApi.listar()]);
    setPagos(p.data);
    setAlumnos(a.data.map((al) => ({ label: `${al.nombre} ${al.apellido}`, value: al.id })));
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async () => {
    try {
      const payload = {
        ...form,
        fechaPago: form.fechaPago instanceof Date
          ? form.fechaPago.toISOString().split('T')[0]
          : form.fechaPago,
      };
      await pagosApi.registrar(payload);
      toast.current.show({ severity: 'success', summary: 'Pago registrado' });
      setDialog(false);
      cargar();
    } catch {
      toast.current.show({ severity: 'error', summary: 'Error al guardar pago' });
    }
  };

  const eliminar = (pago) => {
    confirmDialog({
      message: '¿Eliminar este pago?',
      header:  'Confirmar',
      icon:    'pi pi-trash',
      accept:  async () => { await pagosApi.eliminar(pago.id); cargar(); },
    });
  };

  const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Pagos</h2>
        <Button label="Registrar pago" icon="pi pi-plus"
          onClick={() => { setForm(empty); setDialog(true); }} />
      </div>

      <DataTable value={pagos} loading={loading} paginator rows={10}
        stripedRows emptyMessage="No hay pagos registrados">
        <Column field="alumnoNombre"        header="Alumno"   sortable />
        <Column field="monto"               header="Monto"    sortable body={(r) => fmt.format(r.monto)} />
        <Column field="fechaPago"           header="Fecha"    sortable />
        <Column field="mesCorrespondiente"  header="Mes" />
        <Column field="metodoPago"          header="Método"
          body={(r) => <Tag value={r.metodoPago} severity={METODO_SEVERITY[r.metodoPago]} />} />
        <Column field="concepto"            header="Concepto" />
        <Column header="" style={{ width: '4rem' }}
          body={(r) => (
            <Button icon="pi pi-trash" text rounded severity="danger"
              onClick={() => eliminar(r)} />
          )} />
      </DataTable>

      <Dialog visible={dialog} onHide={() => setDialog(false)}
        header="Registrar pago" style={{ width: '28rem' }}>
        <div className="flex flex-column gap-3 pt-2">
          <div className="flex flex-column gap-1">
            <label className="font-medium">Alumno</label>
            <Dropdown value={form.alumnoId} options={alumnos} filter
              onChange={(e) => setForm((f) => ({ ...f, alumnoId: e.value }))}
              placeholder="Seleccionar alumno" className="w-full" />
          </div>
          <div className="flex flex-column gap-1">
            <label className="font-medium">Monto</label>
            <InputNumber value={form.monto} mode="currency" currency="MXN" locale="es-MX"
              onValueChange={(e) => setForm((f) => ({ ...f, monto: e.value }))}
              className="w-full" />
          </div>
          <div className="flex flex-column gap-1">
            <label className="font-medium">Fecha de pago</label>
            <Calendar value={form.fechaPago} dateFormat="dd/mm/yy" showIcon className="w-full"
              onChange={(e) => setForm((f) => ({ ...f, fechaPago: e.value }))} />
          </div>
          <div className="flex flex-column gap-1">
            <label className="font-medium">Mes correspondiente</label>
            <Dropdown value={form.mesCorrespondiente} options={MESES}
              onChange={(e) => setForm((f) => ({ ...f, mesCorrespondiente: e.value }))}
              className="w-full" />
          </div>
          <div className="flex flex-column gap-1">
            <label className="font-medium">Método de pago</label>
            <Dropdown value={form.metodoPago} options={METODOS}
              onChange={(e) => setForm((f) => ({ ...f, metodoPago: e.value }))}
              className="w-full" />
          </div>
          <div className="flex flex-column gap-1">
            <label className="font-medium">Concepto</label>
            <InputText value={form.concepto}
              onChange={(e) => setForm((f) => ({ ...f, concepto: e.target.value }))} />
          </div>
          <Button label="Guardar" icon="pi pi-save" onClick={guardar} />
        </div>
      </Dialog>
    </div>
  );
}

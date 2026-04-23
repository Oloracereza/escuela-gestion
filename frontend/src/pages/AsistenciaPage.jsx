import { useState, useEffect, useRef } from 'react';
import { asistenciaApi } from '../services/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';

const ESTADOS   = ['PRESENTE', 'AUSENTE', 'JUSTIFICADO', 'TARDANZA'];
const SEVERITY  = { PRESENTE: 'success', AUSENTE: 'danger', JUSTIFICADO: 'warning', TARDANZA: 'info' };

export default function AsistenciaPage() {
  const [fecha,     setFecha]     = useState(new Date());
  const [registros, setRegistros] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const toast = useRef(null);

  const cargar = async () => {
    setLoading(true);
    const iso = fecha.toISOString().split('T')[0];
    try {
      const { data } = await asistenciaApi.porFecha(iso);
      setRegistros(data);
    } catch {
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (fecha) cargar(); }, [fecha]);

  const cambiarEstado = async (registro, nuevoEstado) => {
    try {
      if (registro.id) {
        await asistenciaApi.actualizar(registro.id, { ...registro, estado: nuevoEstado });
      } else {
        await asistenciaApi.registrar({
          alumnoId: registro.alumnoId,
          fecha:    fecha.toISOString().split('T')[0],
          estado:   nuevoEstado,
        });
      }
      cargar();
    } catch {
      toast.current.show({ severity: 'error', summary: 'Error al guardar' });
    }
  };

  const estadoBody = (row) => (
    <Dropdown
      value={row.estado}
      options={ESTADOS}
      onChange={(e) => cambiarEstado(row, e.value)}
      itemTemplate={(o)  => <Tag value={o} severity={SEVERITY[o]} />}
      valueTemplate={(v) => v ? <Tag value={v} severity={SEVERITY[v]} /> : <span>--</span>}
      style={{ minWidth: '150px' }}
    />
  );

  return (
    <div>
      <Toast ref={toast} />
      <div className="flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Asistencia</h2>
        <Calendar
          value={fecha}
          onChange={(e) => setFecha(e.value)}
          dateFormat="dd/mm/yy"
          showIcon
        />
      </div>
      <DataTable
        value={registros}
        loading={loading}
        stripedRows
        emptyMessage="No hay registros para esta fecha"
      >
        <Column field="alumnoNombre"   header="Alumno"        sortable />
        <Column header="Estado"        body={estadoBody} />
        <Column field="observaciones"  header="Observaciones" />
      </DataTable>
    </div>
  );
}

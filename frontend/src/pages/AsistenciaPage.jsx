import { useState, useEffect, useRef } from 'react';
import { asistenciaApi, alumnosApi } from '../services/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { formatLocalDate } from '../utils/date';

const ESTADOS   = ['PRESENTE', 'AUSENTE', 'JUSTIFICADO', 'TARDANZA'];
const SEVERITY  = { PRESENTE: 'success', AUSENTE: 'danger', JUSTIFICADO: 'warning', TARDANZA: 'info' };

export default function AsistenciaPage() {
  const [fecha,     setFecha]     = useState(new Date());
  const [registros, setRegistros] = useState([]);
  const [alumnos,   setAlumnos]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const toast = useRef(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const iso = formatLocalDate(fecha);
      const [asistenciaRes, alumnosRes] = await Promise.all([
        asistenciaApi.porFecha(iso),
        alumnosApi.listar(),
      ]);

      const activos = alumnosRes.data.filter((alumno) => alumno.activo);
      const registrosPorAlumno = new Map(
        asistenciaRes.data.map((registro) => [registro.alumnoId, registro])
      );

      setAlumnos(activos);
      setRegistros(
        activos.map((alumno) => registrosPorAlumno.get(alumno.id) || {
          alumnoId: alumno.id,
          alumnoNombre: `${alumno.nombre} ${alumno.apellido}`,
          observaciones: '',
          estado: null,
        })
      );
    } catch {
      setAlumnos([]);
      setRegistros([]);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar la asistencia del día',
      });
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
          fecha:    formatLocalDate(fecha),
          estado:   nuevoEstado,
          observaciones: registro.observaciones || '',
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
      <div className="page-header mb-3">
        <div>
          <h2 className="m-0">Asistencia</h2>
          <p className="page-subtitle m-0">Pase de lista rápido por día.</p>
        </div>
        <Calendar
          value={fecha}
          onChange={(e) => setFecha(e.value)}
          dateFormat="dd/mm/yy"
          showIcon
          className="w-full sm:w-auto"
        />
      </div>

      {!loading && alumnos.length === 0 && (
        <div className="empty-panel mb-3">
          <i className="pi pi-users empty-panel__icon" />
          <div>
            <div className="empty-panel__title">No hay alumnos activos</div>
            <div className="empty-panel__text">Registra alumnos activos para empezar a pasar lista.</div>
          </div>
        </div>
      )}

      <DataTable
        value={registros}
        loading={loading}
        stripedRows
        emptyMessage="No hay registros para esta fecha"
        responsiveLayout="scroll"
        size="small"
      >
        <Column field="alumnoNombre"   header="Alumno"        sortable />
        <Column header="Estado"        body={estadoBody} />
        <Column field="observaciones"  header="Observaciones" />
      </DataTable>
    </div>
  );
}

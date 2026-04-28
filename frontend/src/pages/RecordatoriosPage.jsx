import { useState, useEffect, useRef } from 'react';
import { alumnosApi, pagosApi } from '../services/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const mesActual = () => {
  const d = new Date();
  return MESES[d.getMonth()] + ' ' + d.getFullYear();
};

export default function RecordatoriosPage() {
  const [alumnos,    setAlumnos]    = useState([]);
  const [pagos,      setPagos]      = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const toast = useRef(null);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      const [a, p] = await Promise.all([alumnosApi.listar(), pagosApi.listar()]);
      setAlumnos(a.data.filter(al => al.activo));
      setPagos(p.data);
      setLoading(false);
    };
    cargar();
  }, []);

  useEffect(() => {
    if (!alumnos.length) return;
    const mes = mesActual();
    const alumnosPagaron = new Set(
      pagos
        .filter(p => p.mesCorrespondiente === mes)
        .map(p => p.alumnoId)
    );
    setPendientes(alumnos.filter(a => !alumnosPagaron.has(a.id)));
  }, [alumnos, pagos]);

  const diasSinPagar = () => {
    const hoy = new Date();
    const primero = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return Math.floor((hoy - primero) / (1000 * 60 * 60 * 24));
  };

  const estadoTag = (dias) => {
    if (dias <= 5)  return <Tag value="Reciente"  severity="info" />;
    if (dias <= 15) return <Tag value="Pendiente" severity="warning" />;
    return                 <Tag value="Vencido"   severity="danger" />;
  };

  const copiarRecordatorio = (alumno) => {
    const texto =
      `Hola ${alumno.nombre}, te recordamos que tu pago de ${mesActual()} ` +
      `está pendiente. Por favor realiza tu pago a la brevedad. ¡Gracias!`;
    if (!navigator.clipboard) {
      toast.current.show({
        severity: 'warn',
        summary: 'No disponible',
        detail: 'Tu navegador no permite copiar automáticamente desde esta pantalla',
        life: 3000,
      });
      return;
    }
    navigator.clipboard.writeText(texto).then(() => {
      toast.current.show({
        severity: 'success',
        summary:  'Copiado',
        detail:   `Mensaje para ${alumno.nombre} copiado al portapapeles`,
        life:     2500,
      });
    });
  };

  const copiarTodos = () => {
    const lista = pendientes
      .map(a => `• ${a.nombre} ${a.apellido} (${a.grupoNombre || 'Sin grupo'})`)
      .join('\n');
    const texto = `Alumnos con pago pendiente — ${mesActual()}:\n${lista}`;
    if (!navigator.clipboard) {
      toast.current.show({
        severity: 'warn',
        summary: 'No disponible',
        detail: 'Tu navegador no permite copiar automáticamente desde esta pantalla',
        life: 3000,
      });
      return;
    }
    navigator.clipboard.writeText(texto).then(() => {
      toast.current.show({
        severity: 'success',
        summary:  'Lista copiada',
        detail:   `${pendientes.length} alumnos copiados al portapapeles`,
        life:     2500,
      });
    });
  };

  const dias = diasSinPagar();

  return (
    <div>
      <Toast ref={toast} />

      <div className="page-header mb-3">
        <div>
          <h2 className="m-0">Recordatorios de pago</h2>
          <p className="page-subtitle m-0">Seguimiento rápido del mes actual.</p>
        </div>
        <div className="flex gap-2 align-items-center flex-wrap">
          <span className="text-sm text-color-secondary font-medium">{mesActual()}</span>
          {pendientes.length > 0 && (
            <Button
              label="Copiar lista completa"
              icon="pi pi-copy"
              severity="secondary"
              outlined
              onClick={copiarTodos}
            />
          )}
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid mb-3">
        <div className="col-12 md:col-4">
          <Card className="text-center">
            <div className="text-4xl font-bold text-primary mb-1">{alumnos.length}</div>
            <div className="text-sm text-color-secondary">Alumnos activos</div>
          </Card>
        </div>
        <div className="col-12 md:col-4">
          <Card className="text-center">
            <div className="text-4xl font-bold text-green-500 mb-1">
              {alumnos.length - pendientes.length}
            </div>
            <div className="text-sm text-color-secondary">Han pagado {mesActual()}</div>
          </Card>
        </div>
        <div className="col-12 md:col-4">
          <Card className="text-center">
            <div className="text-4xl font-bold text-red-500 mb-1">{pendientes.length}</div>
            <div className="text-sm text-color-secondary">Pendientes de pago</div>
          </Card>
        </div>
      </div>

      {/* Lista de pendientes */}
      {pendientes.length === 0 && !loading ? (
        <Card>
          <div className="text-center py-5">
            <i className="pi pi-check-circle text-green-500" style={{ fontSize: '3rem' }} />
            <p className="text-xl font-medium mt-3">¡Todos al corriente!</p>
            <p className="text-color-secondary">Todos los alumnos han pagado {mesActual()}.</p>
          </div>
        </Card>
      ) : (
        <DataTable
          value={pendientes}
          loading={loading}
          stripedRows
          emptyMessage="Todos los alumnos están al corriente"
          responsiveLayout="scroll"
          size="small"
        >
          <Column
            header="Alumno"
            body={(r) => (
              <div>
                <div className="font-medium">{r.nombre} {r.apellido}</div>
                <div className="text-sm text-color-secondary">{r.grupoNombre || 'Sin grupo'}</div>
              </div>
            )}
          />
          <Column field="email"    header="Correo" />
          <Column field="telefono" header="Teléfono" />
          <Column header="Estado"         body={() => estadoTag(dias)} />
          <Column header="Días sin pagar" body={() => <span className="font-medium">{dias} días</span>} />
          <Column
            header="Acción"
            body={(r) => (
              <Button
                icon="pi pi-copy"
                label="Copiar mensaje"
                text
                severity="secondary"
                onClick={() => copiarRecordatorio(r)}
              />
            )}
          />
        </DataTable>
      )}
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import {
  CICLO_ESTADOS,
  cargarAsistencia,
  marcarAsistencia,
  marcarTodosPresentes,
  fechaCambiada,
} from '../store/asistenciaSlice';

const CFG = {
  PRESENTE:    { icon: 'pi pi-check',       bg: '#ECFDF5', border: '#10B981', color: '#065F46', label: 'P' },
  AUSENTE:     { icon: 'pi pi-times',       bg: '#FEF2F2', border: '#EF4444', color: '#991B1B', label: 'A' },
  TARDANZA:    { icon: 'pi pi-clock',       bg: '#FFFBEB', border: '#F59E0B', color: '#92400E', label: 'T' },
  JUSTIFICADO: { icon: 'pi pi-info-circle', bg: '#EFF6FF', border: '#3B82F6', color: '#1D4ED8', label: 'J' },
};

const fmtISO = (d) => d.toISOString().split('T')[0];

export default function AsistenciaPage() {
  const dispatch = useDispatch();
  const { fecha, items, loading, guardando } = useSelector((state) => state.asistencia);
  const toast = useRef(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { dispatch(cargarAsistencia(fecha)); }, []);

  const onFechaChange = (fechaDate) => {
    const iso = fmtISO(fechaDate);
    dispatch(fechaCambiada(iso));
    dispatch(cargarAsistencia(iso));
  };

  const tocar = (item) => {
    const alumnoId = item.alumno.id;
    if (guardando[alumnoId]) return;

    const estadoActual = item.asistencia?.estado ?? 'AUSENTE';
    const idx = CICLO_ESTADOS.indexOf(estadoActual);
    const nuevoEstado = CICLO_ESTADOS[(idx + 1) % CICLO_ESTADOS.length];

    dispatch(marcarAsistencia({
      alumnoId,
      asistenciaId: item.asistencia?.id,
      fecha,
      nuevoEstado,
    }))
      .unwrap()
      .catch(() => toast.current?.show({ severity: 'error', summary: 'No se pudo guardar' }));
  };

  const handleMarcarTodosPresentes = () => {
    dispatch(marcarTodosPresentes())
      .unwrap()
      .then(() => {
        dispatch(cargarAsistencia(fecha));
        toast.current?.show({ severity: 'success', summary: '¡Todos presentes!' });
      })
      .catch(() => toast.current?.show({ severity: 'error', summary: 'Error al guardar' }));
  };

  const presentes = items.filter((it) => it.asistencia?.estado === 'PRESENTE').length;
  const total     = items.length;
  const pct       = total > 0 ? Math.round((presentes / total) * 100) : 0;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Toast ref={toast} />

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Asistencia</h2>
        <Calendar
          value={new Date(fecha)}
          onChange={(e) => onFechaChange(e.value)}
          dateFormat="dd/mm/yy"
          showIcon
          style={{ width: 155 }}
        />
      </div>

      {/* ── Progreso ── */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 13, color: '#6B7280' }}>{presentes} de {total} presentes</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: pct === 100 ? '#059669' : '#374151' }}>{pct}%</span>
        </div>
        <ProgressBar
          value={pct}
          showValue={false}
          style={{ height: 6, borderRadius: 4 }}
          color={pct === 100 ? '#10B981' : undefined}
        />
      </div>

      {/* ── Leyenda ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {Object.entries(CFG).map(([e, c]) => (
          <span key={e} style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500,
            background: c.bg, color: c.color, border: `1px solid ${c.border}`,
          }}>
            {c.label} {e.charAt(0) + e.slice(1).toLowerCase()}
          </span>
        ))}
        <span style={{ fontSize: 11, color: '#9CA3AF', alignSelf: 'center' }}>· Toca para cambiar</span>
      </div>

      {/* ── Botón "todos presentes" ── */}
      <div style={{ marginBottom: 12 }}>
        <Button
          label="Marcar todos presentes"
          icon="pi pi-check-circle"
          severity="success"
          outlined
          size="small"
          onClick={handleMarcarTodosPresentes}
          disabled={loading || presentes === total}
        />
      </div>

      {/* ── Lista ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
          <i className="pi pi-spin pi-spinner" style={{ fontSize: 24 }} />
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
          No hay alumnos activos
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {items.map((item) => {
            const cfg     = CFG[item.asistencia?.estado] ?? CFG.AUSENTE;
            const spinner = guardando[item.alumno.id];
            const initials = `${item.alumno.nombre[0]}${item.alumno.apellido[0]}`;

            return (
              <div
                key={item.alumno.id}
                onClick={() => tocar(item)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 12,
                  background: cfg.bg,
                  border: `1.5px solid ${cfg.border}`,
                  cursor: 'pointer', userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  active: { transform: 'scale(0.98)' },
                }}
                onPointerDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onPointerLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {/* Avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: cfg.border + '33', fontWeight: 700, fontSize: 13,
                  color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {initials}
                </div>

                {/* Nombre + grupo */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: '#111827',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.alumno.nombre} {item.alumno.apellido}
                  </div>
                  {item.alumno.grupoNombre && (
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
                      {item.alumno.grupoNombre}
                    </div>
                  )}
                </div>

                {/* Estado */}
                {spinner ? (
                  <i className="pi pi-spin pi-spinner" style={{ color: cfg.color, fontSize: 18, flexShrink: 0 }} />
                ) : (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                    padding: '4px 10px', borderRadius: 20,
                    background: cfg.border + '22', color: cfg.color,
                    fontSize: 12, fontWeight: 700,
                  }}>
                    <i className={cfg.icon} style={{ fontSize: 12 }} />
                    {cfg.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Espacio extra al final para que el último item no quede tapado ── */}
      <div style={{ height: 16 }} />
    </div>
  );
}

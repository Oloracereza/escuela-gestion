import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { asistenciaApi, alumnosApi } from '../services/api';

export const CICLO_ESTADOS = ['AUSENTE', 'PRESENTE', 'TARDANZA', 'JUSTIFICADO'];

const fmtISO = (d) => d.toISOString().split('T')[0];

const initialState = {
  fecha: fmtISO(new Date()),
  items: [], // [{ alumno, asistencia }]
  loading: false,
  guardando: {}, // { [alumnoId]: { estadoAnterior } } - solo mientras se guarda ese alumno
  error: null,
};

// Carga alumnos activos + su asistencia para una fecha dada.
export const cargarAsistencia = createAsyncThunk(
  'asistencia/cargar',
  async (fechaISO) => {
    const [alumnosRes, asistRes] = await Promise.all([
      alumnosApi.listar(),
      asistenciaApi.porFecha(fechaISO),
    ]);
    const asistMap = {};
    asistRes.data.forEach((a) => {
      asistMap[a.alumnoId] = a;
    });
    return alumnosRes.data
      .filter((a) => a.activo)
      .map((a) => ({
        alumno: a,
        asistencia: asistMap[a.id] ?? { alumnoId: a.id, fecha: fechaISO, estado: 'AUSENTE' },
      }));
  },
);

// Avanza el estado de un alumno al siguiente en el ciclo (toque en la lista).
// La UI se actualiza de inmediato en el reducer 'pending' (optimistic update);
// si la llamada a la API falla, 'rejected' revierte al estado anterior.
export const marcarAsistencia = createAsyncThunk(
  'asistencia/marcar',
  async ({ alumnoId, asistenciaId, fecha, nuevoEstado }) => {
    if (asistenciaId) {
      await asistenciaApi.actualizar(asistenciaId, { alumnoId, fecha, estado: nuevoEstado });
      return { alumnoId, estado: nuevoEstado, asistenciaId };
    }
    const { data } = await asistenciaApi.registrar({ alumnoId, fecha, estado: nuevoEstado });
    return { alumnoId, estado: nuevoEstado, asistenciaId: data.id };
  },
);

export const marcarTodosPresentes = createAsyncThunk(
  'asistencia/marcarTodosPresentes',
  async (_, { getState }) => {
    const { items, fecha } = getState().asistencia;
    await Promise.all(
      items
        .filter((it) => it.asistencia?.estado !== 'PRESENTE')
        .map((it) =>
          it.asistencia?.id
            ? asistenciaApi.actualizar(it.asistencia.id, {
                alumnoId: it.alumno.id,
                fecha,
                estado: 'PRESENTE',
              })
            : asistenciaApi.registrar({ alumnoId: it.alumno.id, fecha, estado: 'PRESENTE' }),
        ),
    );
    return fecha;
  },
);

const asistenciaSlice = createSlice({
  name: 'asistencia',
  initialState,
  reducers: {
    fechaCambiada(state, action) {
      state.fecha = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(cargarAsistencia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cargarAsistencia.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(cargarAsistencia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(marcarAsistencia.pending, (state, action) => {
        const { alumnoId, nuevoEstado } = action.meta.arg;
        const item = state.items.find((it) => it.alumno.id === alumnoId);
        if (item) {
          state.guardando[alumnoId] = { estadoAnterior: item.asistencia?.estado ?? 'AUSENTE' };
          item.asistencia = { ...(item.asistencia ?? {}), estado: nuevoEstado, alumnoId };
        }
      })
      .addCase(marcarAsistencia.fulfilled, (state, action) => {
        const { alumnoId, estado, asistenciaId } = action.payload;
        const item = state.items.find((it) => it.alumno.id === alumnoId);
        if (item) {
          item.asistencia = { ...item.asistencia, id: asistenciaId, estado };
        }
        delete state.guardando[alumnoId];
      })
      .addCase(marcarAsistencia.rejected, (state, action) => {
        const { alumnoId } = action.meta.arg;
        const item = state.items.find((it) => it.alumno.id === alumnoId);
        const previo = state.guardando[alumnoId];
        if (item && previo) {
          item.asistencia = { ...item.asistencia, estado: previo.estadoAnterior };
        }
        delete state.guardando[alumnoId];
      })

      .addCase(marcarTodosPresentes.pending, (state) => {
        state.loading = true;
      })
      .addCase(marcarTodosPresentes.fulfilled, (state) => {
        // Los datos reales llegan al volver a despachar cargarAsistencia(fecha)
        // desde el componente, para reflejar exactamente lo que quedó en el servidor.
        state.loading = false;
      })
      .addCase(marcarTodosPresentes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { fechaCambiada } = asistenciaSlice.actions;
export default asistenciaSlice.reducer;

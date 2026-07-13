import { configureStore } from '@reduxjs/toolkit';
import asistenciaReducer from './asistenciaSlice';

export const store = configureStore({
  reducer: {
    asistencia: asistenciaReducer,
  },
});

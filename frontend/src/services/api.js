import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Alumnos
export const alumnosApi = {
  listar:     ()        => api.get('/alumnos'),
  obtener:    (id)      => api.get(`/alumnos/${id}`),
  crear:      (data)    => api.post('/alumnos', data),
  actualizar: (id,data) => api.put(`/alumnos/${id}`, data),
  desactivar: (id)      => api.delete(`/alumnos/${id}`),
};

// Asistencia
export const asistenciaApi = {
  porAlumno:      (id)           => api.get(`/asistencia/alumno/${id}`),
  porFecha:       (fecha)        => api.get(`/asistencia/fecha/${fecha}`),
  porGrupoYFecha: (grupoId,fecha)=> api.get(`/asistencia/grupo/${grupoId}/fecha/${fecha}`),
  registrar:      (data)         => api.post('/asistencia', data),
  actualizar:     (id,data)      => api.put(`/asistencia/${id}`, data),
};

// Pagos
export const pagosApi = {
  listar:    ()     => api.get('/pagos'),
  porAlumno: (id)   => api.get(`/pagos/alumno/${id}`),
  registrar: (data) => api.post('/pagos', data),
  eliminar:  (id)   => api.delete(`/pagos/${id}`),
};

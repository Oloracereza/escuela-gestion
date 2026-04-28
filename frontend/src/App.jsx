import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute        from './components/layout/PrivateRoute';
import LoginPage           from './pages/LoginPage';
import DashboardPage       from './pages/DashboardPage';
import AlumnosPage         from './pages/AlumnosPage';
import AsistenciaPage      from './pages/AsistenciaPage';
import PagosPage           from './pages/PagosPage';
import UsuariosPage        from './pages/UsuariosPage';
import RecordatoriosPage   from './pages/RecordatoriosPage';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function App() {
  return (
    <PrimeReactProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<PrivateRoute />}>
              <Route path="/"               element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"      element={<DashboardPage />} />
              <Route path="/alumnos"        element={<AlumnosPage />} />
              <Route path="/asistencia"     element={<AsistenciaPage />} />
              <Route path="/pagos"          element={<PagosPage />} />
              <Route path="/recordatorios"  element={<RecordatoriosPage />} />
              <Route path="/usuarios"       element={<UsuariosPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </PrimeReactProvider>
  );
}

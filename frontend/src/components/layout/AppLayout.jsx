import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from 'primereact/button';
import { Menubar } from 'primereact/menubar';

export default function AppLayout({ children }) {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const items = [
    {
      label:   'Dashboard',
      icon:    'pi pi-home',
      command: () => navigate('/dashboard'),
    },
    {
      label:   'Alumnos',
      icon:    'pi pi-users',
      command: () => navigate('/alumnos'),
    },
    ...(hasRole('ROLE_DUENO') || hasRole('ROLE_ENTRENADOR') ? [{
      label:   'Asistencia',
      icon:    'pi pi-calendar-plus',
      command: () => navigate('/asistencia'),
    }] : []),
    ...(hasRole('ROLE_DUENO') || hasRole('ROLE_SECRETARIA') ? [{
      label:   'Pagos',
      icon:    'pi pi-dollar',
      command: () => navigate('/pagos'),
    }] : []),
    ...(hasRole('ROLE_DUENO') || hasRole('ROLE_SECRETARIA') ? [{
      label:   'Recordatorios',
      icon:    'pi pi-bell',
      command: () => navigate('/recordatorios'),
    }] : []),
    ...(hasRole('ROLE_DUENO') ? [{
      label:   'Usuarios',
      icon:    'pi pi-user-edit',
      command: () => navigate('/usuarios'),
    }] : []),
  ];

  const end = (
    <div className="app-userbox">
      <div className="app-userbox__meta">
        <span className="app-userbox__label">Sesión</span>
        <span className="app-userbox__name">{user?.nombre}</span>
      </div>
      <Button
        icon="pi pi-sign-out"
        text
        rounded
        severity="secondary"
        tooltip="Cerrar sesión"
        tooltipOptions={{ position: 'left' }}
        onClick={() => { logout(); navigate('/login'); }}
      />
    </div>
  );

  return (
    <div className="app-shell">
      <Menubar
        model={items}
        start={<div className="app-brand">Escuela</div>}
        end={end}
        className="app-menubar"
      />
      <main className="app-content">{children}</main>
    </div>
  );
}

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
    <div className="flex align-items-center gap-2">
      <i className="pi pi-user" style={{ fontSize: '0.9rem' }} />
      <span className="text-sm font-medium">{user?.nombre}</span>
      <Button
        icon="pi pi-sign-out"
        text rounded
        severity="secondary"
        tooltip="Cerrar sesión"
        tooltipOptions={{ position: 'left' }}
        onClick={() => { logout(); navigate('/login'); }}
      />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-ground)' }}>
      <Menubar
        model={items}
        end={end}
        style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}
      />
      <div className="p-4">{children}</div>
    </div>
  );
}

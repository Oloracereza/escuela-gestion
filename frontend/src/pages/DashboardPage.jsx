import { useAuth } from '../context/AuthContext';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  const cards = [
    {
      show:     true,
      title:    'Alumnos',
      subtitle: 'Gestión de estudiantes',
      desc:     'Consulta, registra y edita los alumnos de la escuela.',
      path:     '/alumnos',
      icon:     'pi pi-users',
      color:    'var(--blue-500)',
    },
    {
      show:     hasRole('ROLE_DUENO') || hasRole('ROLE_ENTRENADOR'),
      title:    'Asistencia',
      subtitle: 'Pase de lista diario',
      desc:     'Registra la asistencia de los alumnos por fecha.',
      path:     '/asistencia',
      icon:     'pi pi-calendar-plus',
      color:    'var(--green-500)',
    },
    {
      show:     hasRole('ROLE_DUENO') || hasRole('ROLE_SECRETARIA'),
      title:    'Pagos',
      subtitle: 'Control de cobros',
      desc:     'Registra y consulta los pagos mensuales de los alumnos.',
      path:     '/pagos',
      icon:     'pi pi-dollar',
      color:    'var(--yellow-600)',
    },
    {
      show:     hasRole('ROLE_DUENO'),
      title:    'Usuarios',
      subtitle: 'Administración del sistema',
      desc:     'Crea y administra las cuentas de secretaria y entrenadores.',
      path:     '/usuarios',
      icon:     'pi pi-user-edit',
      color:    'var(--purple-500)',
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="m-0">Bienvenido, {user?.nombre}</h2>
        <p className="page-subtitle mt-1">Accesos rápidos para el trabajo de hoy.</p>
      </div>

      <div className="grid">
        {cards.filter((c) => c.show).map((c) => (
          <div key={c.path} className="col-12 md:col-6 lg:col-3">
            <Card
              className="dashboard-card h-full cursor-pointer hover:shadow-4 transition-all transition-duration-200"
              onClick={() => navigate(c.path)}
            >
              <div className="flex flex-column align-items-center text-center gap-3 py-2">
                <div
                  className="flex align-items-center justify-content-center border-circle"
                  style={{ width: '4rem', height: '4rem', background: c.color + '22' }}
                >
                  <i className={c.icon} style={{ fontSize: '1.6rem', color: c.color }} />
                </div>
                <div>
                  <div className="font-semibold text-lg">{c.title}</div>
                  <div className="text-sm text-color-secondary mt-1">{c.subtitle}</div>
                </div>
                <p className="m-0 text-sm text-color-secondary">{c.desc}</p>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

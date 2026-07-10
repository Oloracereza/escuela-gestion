import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppLayout from './AppLayout';

export default function PrivateRoute({ roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles?.length && !roles.some((role) => user.roles?.includes(role))) {
    return (
      <AppLayout>
        <div style={{ maxWidth: 520, margin: '48px auto', textAlign: 'center', color: '#374151' }}>
          <i className="pi pi-lock" style={{ fontSize: 32, color: '#9CA3AF' }} />
          <h2 style={{ margin: '16px 0 8px', fontSize: 22 }}>Sin permiso</h2>
          <p style={{ margin: 0, color: '#6B7280' }}>Tu usuario no tiene acceso a esta seccion.</p>
        </div>
      </AppLayout>
    );
  }
  return <AppLayout><Outlet /></AppLayout>;
}

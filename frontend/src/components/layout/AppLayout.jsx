import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout({ children }) {
  const { user, logout, hasRole } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [submenuOpen, setSubmenuOpen] = useState(false);

  const masSubmenu = [
    { label: 'Recordatorios', icon: 'pi pi-bell',      path: '/recordatorios', show: hasRole('ROLE_DUENO') || hasRole('ROLE_SECRETARIA') },
    { label: 'Usuarios',      icon: 'pi pi-user-edit', path: '/usuarios',      show: hasRole('ROLE_DUENO') },
  ].filter(s => s.show);

  const navItems = [
    { label: 'Inicio',     icon: 'pi pi-home',         path: '/dashboard',  show: true },
    { label: 'Alumnos',    icon: 'pi pi-users',         path: '/alumnos',    show: true },
    {
      label: 'Asistencia', icon: 'pi pi-check-square',  path: '/asistencia',
      show: hasRole('ROLE_DUENO') || hasRole('ROLE_ENTRENADOR'),
    },
    {
      label: 'Pagos',      icon: 'pi pi-dollar',        path: '/pagos',
      show: hasRole('ROLE_DUENO') || hasRole('ROLE_SECRETARIA'),
    },
    {
      label: 'Más',        icon: 'pi pi-ellipsis-h',    path: '/mas',
      show: masSubmenu.length > 0,
      submenu: masSubmenu,
    },
  ].filter(i => i.show);

  const isActive = (path) =>
    location.pathname === path ||
    (path === '/mas' && ['/recordatorios', '/usuarios'].includes(location.pathname));

  const handleNav = (item) => {
    if (item.path === '/mas') { setSubmenuOpen(o => !o); return; }
    setSubmenuOpen(false);
    navigate(item.path);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA', paddingBottom: 72 }}>

      {/* ── Top bar ── */}
      <div style={{
        background: '#1C2333', padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>Sistema Escolar</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{user?.nombre}</div>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} style={{
          background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8,
          padding: '6px 12px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
          fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <i className="pi pi-sign-out" style={{ fontSize: 13 }} />
          Salir
        </button>
      </div>

      {/* ── Contenido ── */}
      <div style={{ padding: 16 }}>{children}</div>

      {/* ── Submenu "Más" ── */}
      {submenuOpen && (
        <>
          <div onClick={() => setSubmenuOpen(false)} style={{
            position: 'fixed', inset: 0, zIndex: 199,
            background: 'rgba(0,0,0,0.25)',
          }} />
          <div style={{
            position: 'fixed', bottom: 72, left: 0, right: 0,
            background: '#fff', borderRadius: '16px 16px 0 0',
            borderTop: '1px solid #E5E7EB', zIndex: 200,
            padding: '12px 0 8px',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          }}>
            {navItems.find(i => i.path === '/mas')?.submenu?.map(s => (
              <div key={s.path} onClick={() => { setSubmenuOpen(false); navigate(s.path); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 24px', cursor: 'pointer',
                  background: location.pathname === s.path ? '#EFF6FF' : 'transparent',
                  color:      location.pathname === s.path ? '#1D4ED8' : '#374151',
                }}>
                <i className={s.icon} style={{ fontSize: 18 }} />
                <span style={{ fontSize: 15, fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Bottom nav ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '0.5px solid #E5E7EB',
        display: 'flex', zIndex: 100,
      }}>
        {navItems.map(item => {
          const active = isActive(item.path);
          return (
            <button key={item.path} onClick={() => handleNav(item)} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 3,
              padding: '10px 4px 8px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: active ? '#1C2333' : '#9CA3AF',
            }}>
              <i className={item.icon} style={{ fontSize: 21 }} />
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{item.label}</span>
              {active && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#1C2333' }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

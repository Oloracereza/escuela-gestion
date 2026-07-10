import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();
  const toast     = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      toast.current.show({
        severity: 'error',
        summary:  'Acceso denegado',
        detail:   'Correo o contraseña incorrectos',
        life:     3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:      '100vh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      background:     '#F8FAFC',
      padding:        '24px',
    }}>
      <Toast ref={toast} />

      <div style={{
        width:        '100%',
        maxWidth:     380,
        background:   '#fff',
        borderRadius: 20,
        boxShadow:    '0 4px 24px rgba(0,0,0,0.08)',
        overflow:     'hidden',
      }}>
        {/* Header de color */}
        <div style={{
          background: '#1C2333',
          padding:    '32px 32px 28px',
          textAlign:  'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <i className="pi pi-users" style={{ fontSize: 26, color: '#fff' }} />
          </div>
          <div style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>Sistema Escolar</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 4 }}>
            Gestión deportiva
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} style={{ padding: '28px 32px 32px' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280',
              textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 6 }}>
              Correo
            </label>
            <InputText
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@escuela.com"
              type="email"
              autoComplete="email"
              className="w-full"
              style={{ borderRadius: 10 }}
              required
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280',
              textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 6 }}>
              Contraseña
            </label>
            <Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              feedback={false}
              toggleMask
              className="w-full"
              inputClassName="w-full"
              inputStyle={{ borderRadius: 10 }}
              required
            />
          </div>

          <Button
            type="submit"
            label={loading ? 'Entrando...' : 'Entrar'}
            icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
            loading={loading}
            className="w-full"
            style={{
              borderRadius: 10,
              height:       46,
              background:   '#1C2333',
              border:       'none',
              fontWeight:   600,
            }}
          />
        </form>
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from 'primereact/card';
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
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      toast.current.show({
        severity: 'error',
        summary:  'Error',
        detail:   'Credenciales incorrectas',
        life:     3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex justify-content-center align-items-center"
      style={{ minHeight: '100vh', background: 'var(--surface-ground)' }}
    >
      <Toast ref={toast} />
      <Card className="w-full md:w-4 shadow-4" title="Sistema Escolar">
        <form onSubmit={handleLogin} className="flex flex-column gap-3">
          <div className="flex flex-column gap-1">
            <label htmlFor="email" className="font-medium">Correo</label>
            <InputText
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@escuela.com"
              required
              className="w-full"
            />
          </div>
          <div className="flex flex-column gap-1">
            <label htmlFor="password" className="font-medium">Contraseña</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              feedback={false}
              toggleMask
              className="w-full"
              inputClassName="w-full"
              required
            />
          </div>
          <Button
            type="submit"
            label="Entrar"
            icon="pi pi-sign-in"
            loading={loading}
            className="w-full mt-2"
          />
        </form>
      </Card>
    </div>
  );
}

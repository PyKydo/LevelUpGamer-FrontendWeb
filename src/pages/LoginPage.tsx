import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { authenticateUser } from '../helpers/api.helper';
import {
  validateEmail,
  validatePassword,
} from '../helpers/validation.helper';
import { FormFloating } from '../components/common/FormFloating';
import { FormSelect } from '../components/common/FormSelect';
import { reportError } from '../helpers/logging.helper';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CLIENTE');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showNotification } = useNotification();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateEmail(email)) {
      showNotification(
        'Correo inválido. Solo se permiten correos de @duoc.cl, @profesor.duoc.cl o @gmail.com.',
        'error'
      );
      return;
    }

    if (!validatePassword(password, { min: 8, strict: false })) {
      showNotification('La contraseña debe tener al menos 8 caracteres.', 'error');
      return;
    }

    try {
      const foundUser = await authenticateUser(email, password, role);
      if (foundUser) {
        login(foundUser);
        showNotification('Inicio de sesión exitoso.', 'success');
        if (foundUser.role === 'ADMINISTRADOR') {
          navigate('/admin');
        } else if (foundUser.role === 'VENDEDOR') {
          navigate('/seller');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      reportError('LoginPage:authenticate', error);
      if (isAxiosError(error) && error.code === 'ERR_NETWORK') {
        showNotification('No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo en el puerto 8081.', 'error');
      } else if (
        isAxiosError(error) &&
        error.response &&
        (error.response.status === 401 || error.response.status === 404)
      ) {
        showNotification('Credenciales incorrectas o usuario no encontrado.', 'error');
      } else {
        showNotification('Ocurrió un error al iniciar sesión.', 'error');
      }
    }
  };

  return (
    <main className="d-flex align-items-center justify-content-center flex-grow-1 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="form-signin">
              <form id="login-form" onSubmit={handleSubmit}>
                <div className="logo-container text-center mb-3">
                  <Link to="/" id="logo-link" className="d-inline-block">
                    <img
                      className="logo-img"
                      src="/img/logo.png"
                      alt="Logo Level-Up Gamer"
                      width="72"
                    />
                  </Link>
                </div>
                <h1 className="h3 mb-3 fw-normal text-center">Iniciar Sesión</h1>
                <FormFloating
                  id="email"
                  type="email"
                  label="Correo Electrónico"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FormFloating
                  id="password"
                  type="password"
                  label="Contraseña"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <FormSelect
                  id="role"
                  label="Rol"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  floating
                  options={[
                    { value: 'CLIENTE', label: 'Cliente' },
                    { value: 'VENDEDOR', label: 'Vendedor' },
                    { value: 'ADMINISTRADOR', label: 'Administrador' },
                  ]}
                />

                <div className="form-check text-start my-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value="remember-me"
                    id="rememberMe"
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Recuérdame
                  </label>
                </div>
                <button className="btn btn-primary w-100 py-2 mb-3" type="submit">
                  Ingresar
                </button>

                <p className="mt-4 text-center">
                  ¿No tienes una cuenta?
                  <Link to="/register" className="text-primary ms-2">
                    Regístrate aquí
                  </Link>
                </p>
                <p className="mt-4 mb-4 text-center copyright-text">© 2025</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

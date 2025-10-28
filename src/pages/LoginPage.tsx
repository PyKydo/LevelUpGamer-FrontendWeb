import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authenticateUser } from '../helpers/api.helper';
import {
  validateEmail,
  validatePassword,
} from '../helpers/validation.helper';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateEmail(email)) {
      alert(
        'Correo inválido. Solo se permiten correos de @duoc.cl, @profesor.duoc.cl o @gmail.com.',
      );
      return;
    }

    if (!validatePassword(password, { min: 4, max: 10 })) {
      alert('La contraseña debe tener entre 4 y 10 caracteres.');
      return;
    }

    try {
      const foundUser = await authenticateUser(email, password);

      if (foundUser) {
        login(foundUser);
        alert('Inicio de sesión exitoso.');
        navigate('/'); // Redirige al home
      } else {
        alert('Correo o contraseña incorrectos.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Ocurrió un error durante el inicio de sesión.');
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
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label htmlFor="email">Correo Electrónico</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label htmlFor="password">Contraseña</label>
                </div>
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
                  <Link to="/register" className="text-primary">
                    Regístrate aquí
                  </Link>
                </p>
                <p className="mt-4 mb-4 text-body-secondary text-center">© 2025</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

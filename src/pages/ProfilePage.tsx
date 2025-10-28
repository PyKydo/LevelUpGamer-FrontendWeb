import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import { getLocalStorageItem, setLocalStorageItem } from '../helpers/storage.helper';
import { simpleHash } from '../helpers/security.helper';
import type { UserWithPassword } from '../hooks/AuthContext';

export const ProfilePage = () => {
  const { user, login } = useAuth();
  const { showNotification } = useNotification();

  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim()) {
      showNotification('El nombre de usuario no puede estar vacío.', 'error');
      return;
    }

    const users = getLocalStorageItem<UserWithPassword[]>('users') || [];
    const userIndex = users.findIndex((u) => u.id === user.id);

    if (userIndex !== -1) {
      const updatedUser = { ...users[userIndex], username };
      if (password) {
        updatedUser.password = simpleHash(password);
      }
      users[userIndex] = updatedUser;
      setLocalStorageItem('users', users);

      const { password: _, ...userToLogin } = updatedUser;
      login(userToLogin);

      showNotification('Perfil actualizado correctamente.', 'success');
      setPassword('');
    }
  };

  return (
    <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Perfil de Usuario</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label"><strong>Nombre de usuario:</strong></label>
                  <input
                    type="text"
                    id="username"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label"><strong>Email:</strong></label>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    value={user.email}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" class="form-label"><strong>Nueva Contraseña (dejar en blanco para no cambiar):</strong></label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

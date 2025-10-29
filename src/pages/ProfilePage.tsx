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

  const [formData, setFormData] = useState({
    name: user?.name || '',
    lastName: user?.lastName || '',
    address: user?.address || '',
    password: '',
  });

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.lastName.trim()) {
      showNotification('El nombre y el apellido no pueden estar vacíos.', 'error');
      return;
    }

    const users = getLocalStorageItem<UserWithPassword[]>('users') || [];
    const userIndex = users.findIndex((u) => u.id === user.id);

    if (userIndex !== -1) {
      const updatedUser = {
        ...users[userIndex],
        name: formData.name,
        lastName: formData.lastName,
        address: formData.address,
      };

      if (formData.password) {
        updatedUser.password = simpleHash(formData.password);
      }

      users[userIndex] = updatedUser;
      setLocalStorageItem('users', users);

  const { password: _removedPassword, ...userToLogin } = updatedUser;
  void _removedPassword;
  login(userToLogin);

      showNotification('Perfil actualizado correctamente.', 'success');
      setFormData((prev) => ({ ...prev, password: '' }));
    }
  };

  return (
    <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4">
            <div className="card-body">
              <div className="form-signin">
                <h2 className="card-title text-center mb-4">Perfil de Usuario</h2>
                <form onSubmit={handleSubmit}>
                                  <div className="row">
                                    <div className="col-md-6 mb-3">
                                      <div className="form-floating">
                                        <input
                                          type="text"
                                          id="name"
                                          name="name"
                                          className="form-control"
                                          value={formData.name}
                                          onChange={handleChange}
                                          placeholder="Nombre"
                                        />
                                        <label htmlFor="name">Nombre</label>
                                      </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                      <div className="form-floating">
                                        <input
                                          type="text"
                                          id="lastName"
                                          name="lastName"
                                          className="form-control"
                                          value={formData.lastName}
                                          onChange={handleChange}
                                          placeholder="Apellido"
                                        />
                                        <label htmlFor="lastName">Apellido</label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mb-3">
                                    <div className="form-floating">
                                      <input
                                        type="email"
                                        id="email"
                                        className="form-control"
                                        value={user.email}
                                        disabled
                                        placeholder="Email"
                                      />
                                      <label htmlFor="email">Email</label>
                                    </div>
                                  </div>
                                  <div className="mb-3">
                                    <div className="form-floating">
                                      <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        className="form-control"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Dirección"
                                      />
                                      <label htmlFor="address">Dirección</label>
                                    </div>
                                  </div>
                                  <div className="mb-3">
                                    <div className="form-floating">
                                      <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        className="form-control"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Nueva Contraseña"
                                      />
                                      <label htmlFor="password">Nueva Contraseña (dejar en blanco para no cambiar)</label>
                                    </div>
                                  </div>                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import { getLocalStorageItem, setLocalStorageItem } from '../helpers/storage.helper';
import { simpleHash } from '../helpers/security.helper';
import type { UserWithPassword } from '../hooks/AuthContext';
import { FormFloating } from '../components/common/FormFloating';

export const ProfilePage = () => {
  const { user, login, logout } = useAuth();
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
          <div className="card bg-dark text-white p-4 shadow-sm">
            <div className="card-body">
              <div className="form-signin">
                <h2 className="card-title text-center mb-4 text-white">Perfil de Usuario</h2>
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <FormFloating
                        id="name"
                        name="name"
                        type="text"
                        label="Nombre"
                        placeholder="Nombre"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <FormFloating
                        id="lastName"
                        name="lastName"
                        type="text"
                        label="Apellido"
                        placeholder="Apellido"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <FormFloating
                      id="email"
                      type="email"
                      label="Email"
                      placeholder="Email"
                      value={user.email}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <FormFloating
                      id="address"
                      name="address"
                      type="text"
                      label="Dirección"
                      placeholder="Dirección"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <FormFloating
                      id="password"
                      name="password"
                      type="password"
                      label="Nueva Contraseña (dejar en blanco para no cambiar)"
                      placeholder="Nueva Contraseña"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                    <button type="button" className="btn btn-danger" onClick={logout}>Cerrar Sesión</button>
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

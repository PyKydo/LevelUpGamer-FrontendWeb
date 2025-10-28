import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Perfil de Usuario</h2>
              <div className="mb-3">
                <p className="mb-0"><strong>Nombre de usuario:</strong></p>
                <p className="text-primary">{user.username}</p>
              </div>
              <div className="mb-3">
                <p className="mb-0"><strong>Email:</strong></p>
                <p className="text-primary">{user.email}</p>
              </div>
              <div className="mb-3">
                <p className="mb-0"><strong>Rol:</strong></p>
                <p className="text-primary">{user.role}</p>
              </div>
            </div>
            <div className="card-footer text-center">
              <p className="text-muted mb-0">Más opciones de configuración estarán disponibles pronto.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

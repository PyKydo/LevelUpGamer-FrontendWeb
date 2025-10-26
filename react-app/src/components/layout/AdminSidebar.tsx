import { Link } from 'react-router-dom';

export const AdminSidebar = () => {
  return (
    <nav id="sidebar-wrapper">
      <div className="sidebar-heading text-center">
        <img src="/img/logo.png" alt="Level-Up Gamer" height="40" />
        <span className="ms-2">Admin</span>
      </div>
      <div className="list-group list-group-flush">
        <Link to="/admin" className="list-group-item list-group-item-action">
          <i className="bi bi-speedometer2"></i> Dashboard
        </Link>
        <Link to="/admin/products" className="list-group-item list-group-item-action">
          <i className="bi bi-box-seam"></i> Productos
        </Link>
        <Link to="/admin/users" className="list-group-item list-group-item-action">
          <i className="bi bi-people"></i> Usuarios
        </Link>
        <Link to="/" className="list-group-item list-group-item-action mt-auto">
          <i className="bi bi-box-arrow-left"></i> Volver a la Tienda
        </Link>
      </div>
    </nav>
  );
};
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    FaUsers,
    FaBoxOpen,
    FaNewspaper,
    FaReceipt,
    FaTags,
    FaComments,
    FaSignOutAlt,
    FaHome
} from 'react-icons/fa';

interface SidebarProps {
    role: 'ADMINISTRADOR' | 'VENDEDOR';
}

export const Sidebar = ({ role }: SidebarProps) => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{ width: '280px', minHeight: '100vh' }}>
            <Link to="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <img src="/img/logo.png" alt="Logo" width="40" height="32" className="me-2" />
                <span className="fs-4">LevelUp</span>
            </Link>
            <hr />
            <div className="mb-3">
                <small className="text-muted text-uppercase">{role}</small>
                <div className="fw-bold">{user?.name}</div>
            </div>
            <ul className="nav nav-pills flex-column mb-auto">
                {role === 'ADMINISTRADOR' && (
                    <>
                        <li className="nav-item">
                            <Link to="/admin" className={`nav-link text-white ${isActive('/admin') ? 'active' : ''}`}>
                                <FaHome className="me-2" /> Inicio
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/users" className={`nav-link text-white ${isActive('/admin/users') ? 'active' : ''}`}>
                                <FaUsers className="me-2" /> Usuarios
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/products" className={`nav-link text-white ${isActive('/admin/products') ? 'active' : ''}`}>
                                <FaBoxOpen className="me-2" /> Productos
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/blogs" className={`nav-link text-white ${isActive('/admin/blogs') ? 'active' : ''}`}>
                                <FaNewspaper className="me-2" /> Blogs
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/categories" className={`nav-link text-white ${isActive('/admin/categories') ? 'active' : ''}`}>
                                <FaTags className="me-2" /> Categorías
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/reviews" className={`nav-link text-white ${isActive('/admin/reviews') ? 'active' : ''}`}>
                                <FaComments className="me-2" /> Reseñas
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/orders" className={`nav-link text-white ${isActive('/admin/orders') ? 'active' : ''}`}>
                                <FaReceipt className="me-2" /> Boletas
                            </Link>
                        </li>
                    </>
                )}

                {role === 'VENDEDOR' && (
                    <>
                        <li className="nav-item">
                            <Link to="/seller" className={`nav-link text-white ${isActive('/seller') ? 'active' : ''}`}>
                                <FaHome className="me-2" /> Inicio
                            </Link>
                        </li>
                        <li>
                            <Link to="/seller/products" className={`nav-link text-white ${isActive('/seller/products') ? 'active' : ''}`}>
                                <FaBoxOpen className="me-2" /> Mis Productos
                            </Link>
                        </li>
                        <li>
                            <Link to="/seller/orders" className={`nav-link text-white ${isActive('/seller/orders') ? 'active' : ''}`}>
                                <FaReceipt className="me-2" /> Boletas
                            </Link>
                        </li>
                    </>
                )}
            </ul>
            <hr />
            <div>
                <button onClick={logout} className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center">
                    <FaSignOutAlt className="me-2" /> Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

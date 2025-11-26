import { Link } from 'react-router-dom';
import { useState } from 'react';
import { IoCart, IoPerson, IoLogOut } from 'react-icons/io5';
import styles from './Header.module.css';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { SearchBar } from '../common/SearchBar';

export const Header = () => {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  const closeNav = () => {
    if (!isNavCollapsed) {
      setIsNavCollapsed(true);
    }
  };

  return (
    <header className={`bg-dark shadow-sm ${styles.header}`}>
      <nav className={`navbar navbar-expand-lg navbar-dark bg-dark py-3 ${styles.navbar}`}>
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <img className={styles.logo} src="/img/logo.png" alt="Logo Level-Up Gamer" />
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            aria-controls="navbarSupportedContent"
            aria-expanded={!isNavCollapsed}
            aria-label="Toggle navigation"
            onClick={handleNavCollapse}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`collapse navbar-collapse ${!isNavCollapsed ? 'show' : ''}`} id="navbarSupportedContent">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-2 gap-2 gap-md-3">
              <li className="nav-item"><Link to="/" className="nav-link home-item" onClick={closeNav}>Inicio</Link></li>
              <li className="nav-item"><Link to="/products" className="nav-link products-item" onClick={closeNav}>Productos</Link></li>
              <li className="nav-item"><Link to="/about" className="nav-link about-item" onClick={closeNav}>Nosotros</Link></li>
              <li className="nav-item"><Link to="/blog" className="nav-link blogs-item" onClick={closeNav}>Blogs</Link></li>
              <li className="nav-item"><Link to="/contact" className="nav-link contact-item" onClick={closeNav}>Contacto</Link></li>

              <li className="nav-item d-lg-none"><Link to="/cart" className="nav-link" onClick={closeNav}>Carrito ({totalItems})</Link></li>
              {user ? (
                <li className="nav-item d-lg-none"><Link to="/profile" className="nav-link" onClick={closeNav}>Perfil</Link></li>
              ) : (
                <li className="nav-item d-lg-none"><Link to="/login" className="nav-link" onClick={closeNav}>Iniciar Sesión / Registro</Link></li>
              )}
            </ul>
          </div>
          <Link to="/cart" className="d-none d-lg-block me-2">
            <button type="button" className="btn btn-accent login-signup-btn" aria-label="Carrito de Compras">
              <IoCart size={24} />
              <span className={`badge rounded-pill ${styles.cartCount}`}>{totalItems}</span>
            </button>
          </Link>
          {user ? (
            <div className="d-none d-lg-flex align-items-center">
              <Link to="/profile" className="me-2">
                <button type="button" className="btn btn-accent login-signup-btn" aria-label="Perfil de Usuario">
                  <IoPerson />
                </button>
              </Link>
              <button onClick={logout} className="btn btn-danger" aria-label="Cerrar Sesión">
                <IoLogOut size={24} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="ms-auto d-none d-lg-block">
              <button type="button" className="btn btn-accent login-signup-btn" aria-label="Registro / Iniciar Sesión">
                <IoPerson />
              </button>
            </Link>
          )}
        </div>
      </nav>
      <div className="subheader py-3 bg-dark">
        <div className="container-fluid">
          <SearchBar />
        </div>
      </div>
    </header>
  );
};
import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <header className="bg-dark shadow-sm">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-3">
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <img className="logo" src="/img/logo.png" alt="Logo Level-Up Gamer" />
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-2 gap-2 gap-md-3">
              <li className="nav-item">
                <Link to="/" className="nav-link home-item">Inicio</Link>
              </li>
              <li className="nav-item">
                <Link to="/products" className="nav-link products-item">Productos</Link>
              </li>
              <li className="nav-item">
                <Link to="/about" className="nav-link about-item">Nosotros</Link>
              </li>
              <li className="nav-item">
                <Link to="/blog" className="nav-link blogs-item">Blogs</Link>
              </li>
              <li className="nav-item">
                <Link to="/contact" className="nav-link contact-item">Contacto</Link>
              </li>
            </ul>
          </div>
          <Link to="/cart" className="d-none d-lg-block me-2">
            <button
              type="button"
              className="btn btn-accent login-signup-btn"
              aria-label="Carrito de Compras"
            >
              <span className="bi bi-cart"></span>
              <span className="badge rounded-pill" id="cart-count">0</span>
            </button>
          </Link>
          <Link to="/login" className="ms-auto d-none d-lg-block">
            <button
              type="button"
              className="btn btn-accent login-signup-btn"
              aria-label="Registro / Iniciar Sesión"
            >
              <span className="bi bi-person-circle"></span>
            </button>
          </Link>
        </div>
      </nav>
      <div className="subheader py-3 bg-dark">
        <div className="container-fluid">
          <form
            className="row justify-content-center align-items-center gx-2"
            role="search"
          >
            <div className="col-12 col-md-8 col-lg-6 d-flex justify-content-center search-container-wrapper">
              <div className="input-group search-group w-100">
                <input
                  className="form-control search-bar bg-white text-dark border border-secondary"
                  type="text"
                  placeholder="Buscar"
                  aria-label="Buscar"
                />
                <button
                  className="btn btn-primary search-btn border border-secondary"
                  type="submit"
                  aria-label="Buscar"
                >
                  <span className="bi bi-search"></span>
                </button>
              </div>
              <div id="search-results" className="list-group position-absolute w-100" style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto', display: 'none' }}>
              </div>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
};
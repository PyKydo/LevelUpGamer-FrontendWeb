import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import productsData from '../../data/products.json';

interface Product {
  code: string;
  name: string;
  image: string;
  price: number;
}

export const Header = () => {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
      return;
    }
    const filtered = productsData.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
    setSuggestions(filtered as Product[]);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSuggestions([]);
      navigate(`/products?q=${searchTerm.trim()}`);
    }
  };

  const handleSuggestionClick = () => {
    setSearchTerm('');
    setSuggestions([]);
  };

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
            aria-controls="navbarSupportedContent"
            aria-expanded={!isNavCollapsed}
            aria-label="Toggle navigation"
            onClick={handleNavCollapse}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`collapse navbar-collapse ${!isNavCollapsed ? 'show' : ''}`} id="navbarSupportedContent">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-2 gap-2 gap-md-3">
              <li className="nav-item"><Link to="/" className="nav-link home-item">Inicio</Link></li>
              <li className="nav-item"><Link to="/products" className="nav-link products-item">Productos</Link></li>
              <li className="nav-item"><Link to="/about" className="nav-link about-item">Nosotros</Link></li>
              <li className="nav-item"><Link to="/blog" className="nav-link blogs-item">Blogs</Link></li>
              <li className="nav-item"><Link to="/contact" className="nav-link contact-item">Contacto</Link></li>
            </ul>
          </div>
          <Link to="/cart" className="d-none d-lg-block me-2">
            <button type="button" className="btn btn-accent login-signup-btn" aria-label="Carrito de Compras">
              <span className="bi bi-cart"></span>
              <span className="badge rounded-pill" id="cart-count">{totalItems}</span>
            </button>
          </Link>
          {user ? (
            <div className="d-none d-lg-flex align-items-center">
              <span className="navbar-text me-3">Hola, {user.username}</span>
              <button onClick={logout} className="btn btn-outline-danger">Cerrar Sesión</button>
            </div>
          ) : (
            <Link to="/login" className="ms-auto d-none d-lg-block">
              <button type="button" className="btn btn-accent login-signup-btn" aria-label="Registro / Iniciar Sesión">
                <span className="bi bi-person-circle"></span>
              </button>
            </Link>
          )}
        </div>
      </nav>
      <div className="subheader py-3 bg-dark">
        <div className="container-fluid">
          <form
            className="row justify-content-center align-items-center gx-2"
            role="search"
            onSubmit={handleSearchSubmit}
          >
            <div className="col-12 col-md-8 col-lg-6 d-flex justify-content-center">
              <div ref={searchContainerRef} className="search-container-wrapper search-group">
                <div className="input-group w-100">
                  <input
                    className={`form-control search-bar bg-white text-dark border border-secondary ${suggestions.length > 0 ? 'suggestions-open' : ''}`}
                    type="text"
                    placeholder="Buscar"
                    aria-label="Buscar"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoComplete="off"
                  />
                  <button
                    className={`btn btn-primary search-btn border border-secondary ${suggestions.length > 0 ? 'suggestions-open' : ''}`}
                    type="submit"
                    aria-label="Buscar"
                  >
                    <span className="bi bi-search"></span>
                  </button>
                </div>
                {suggestions.length > 0 && (
                  <div id="search-results" className="list-group position-absolute w-100">
                    {suggestions.map(product => (
                      <Link 
                        key={product.code} 
                        to={`/products?q=${product.name}`}
                        className="list-group-item list-group-item-action bg-dark text-white border-secondary"
                        onClick={handleSuggestionClick}
                      >
                         <div className="d-flex align-items-center">
                          <img src={`/img/products/${product.image}`} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '8px' }}/>
                          <div>
                              <h6 className="mb-0">{product.name}</h6>
                              <small>${product.price.toLocaleString('es-CL')}</small>
                          </div>
                      </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
};
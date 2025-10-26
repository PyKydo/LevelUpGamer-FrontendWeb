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
  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
      return;
    }

    const filtered = productsData.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5); // Limitar a 5 sugerencias
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
        {/* ... Código del navbar sin cambios ... */}
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
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoSearch } from 'react-icons/io5';
import { useSearch } from '../../hooks/useSearch';
import productsData from '../../data/products.json';
import styles from './SearchBar.module.css';

interface Product {
    code: string;
    name: string;
    image: string;
    price: number;
}

export const SearchBar = () => {
    const { searchTerm, setSearchTerm } = useSearch();
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
        <form
            className="row justify-content-center align-items-center gx-2"
            role="search"
            onSubmit={handleSearchSubmit}
        >
            <div className="col-12 col-md-8 col-lg-6 d-flex justify-content-center">
                <div ref={searchContainerRef} className={`search-container-wrapper search-group ${styles.searchContainerWrapper} ${styles.searchGroup}`}>
                    <div className="input-group w-100">
                        <input
                            className={`form-control search-bar bg-white text-dark border border-secondary ${styles.searchBar} ${suggestions.length > 0 ? styles.suggestionsOpen : ''}`}
                            type="text"
                            placeholder="Buscar"
                            aria-label="Buscar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoComplete="off"
                        />
                        <button
                            className={`btn btn-primary search-btn border border-secondary ${styles.searchBtn} ${suggestions.length > 0 ? styles.suggestionsOpen : ''}`}
                            type="submit"
                            aria-label="Buscar"
                        >
                            <IoSearch />
                        </button>
                    </div>
                    {suggestions.length > 0 && (
                        <div id="search-results" className={`list-group position-absolute w-100 ${styles.searchResults}`}>
                            {suggestions.map(product => (
                                <Link
                                    key={product.code}
                                    to={`/products/${product.code}`}
                                    className={`list-group-item list-group-item-action bg-dark text-white border-secondary ${styles.listGroupItem}`}
                                    onClick={handleSuggestionClick}
                                >
                                    <div className="d-flex align-items-center">
                                        <img src={`/img/products/${product.image}`} alt={product.name} className={styles.searchThumb} />
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
    );
};

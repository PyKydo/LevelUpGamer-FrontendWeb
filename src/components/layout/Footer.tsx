import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={`bg-dark text-white py-5 shadow-sm ${styles.footer}`}>
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4 mb-md-0 text-center">
            <h5 className="mb-3">Enlaces Rápidos</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/products" className="text-white text-decoration-none">Productos</Link>
              </li>
              <li><Link to="/about" className="text-white text-decoration-none">Nosotros</Link></li>
              <li><Link to="/blog" className="text-white text-decoration-none">Blog</Link></li>
              <li><Link to="/contact" className="text-white text-decoration-none">Contacto</Link></li>
            </ul>
          </div>
          <div className="col-md-4 mb-4 mb-md-0 text-center">
            <img
              src="/img/logotype.png"
              alt="Level-Up Gamer Logotype"
              className={`img-fluid mb-3 ${styles.footerLogo}`}
              style={{ width: '150px' }}
            />
            <p>
              Tu tienda de confianza para todo lo relacionado con gaming en Chile.
            </p>
          </div>
          <div className="col-md-4 text-center">
            <h5 className="mb-3">Síguenos</h5>
            <div className={`d-flex gap-3 justify-content-center ${styles.socialIcons}`}>
              <a href="#" className="text-white"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-white"><i className="bi bi-twitter"></i></a>
              <a href="#" className="text-white"><i className="bi bi-instagram"></i></a>
            </div>
          </div>
        </div>
        <hr className="my-4" />
        <div className="text-center">
          <p className="mb-0">
            &copy; 2025 Level-Up Gamer. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
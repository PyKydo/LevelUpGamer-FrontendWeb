export const Footer = () => {
  return (
    <footer className="bg-dark text-white py-5 shadow-sm">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4 mb-md-0 text-center">
            <h5 className="mb-3">Enlaces Rápidos</h5>
            <ul className="list-unstyled">
              <li>
                <a href="/views/shop/products.html" className="text-white">Productos</a>
              </li>
              <li><a href="/views/about.html" className="text-white">Nosotros</a></li>
              <li><a href="/views/blog.html" className="text-white">Blog</a></li>
              <li><a href="/views/contact.html" className="text-white">Contacto</a></li>
            </ul>
          </div>
          <div className="col-md-4 mb-4 mb-md-0 text-center">
            <img
              src="/img/logotype.png"
              alt="Level-Up Gamer Logotype"
              className="img-fluid mb-3 footer-logo"
              style={{ width: '150px' }}
            />
            <p>
              Tu tienda de confianza para todo lo relacionado con gaming en Chile.
            </p>
          </div>
          <div className="col-md-4 text-center">
            <h5 className="mb-3">Síguenos</h5>
            <div className="d-flex gap-3 justify-content-center">
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
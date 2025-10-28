import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/common/ProductCard';
import { getProducts, type Product } from '../helpers/api.helper';
import { formatCurrency } from '../helpers/formatting.helper';

export const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const carouselProducts = products.slice(0, 3);
  const featuredProducts = products.slice(3, 7);

  return (
    <div className="container my-5">
      {/* Carrusel de Productos */}
      <div
        id="productCarousel"
        className="carousel slide mb-5"
        data-bs-ride="carousel"
      >
        <div className="carousel-inner">
          {carouselProducts.map((product, index) => (
            <div
              className={`carousel-item ${index === 0 ? 'active' : ''}`}
              key={product.code}
            >
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: '400px', backgroundColor: 'white' }}
              >
                <Link
                  to={`/products?q=${product.name}`}
                  className="d-block h-100 w-100 text-decoration-none carousel-image-wrapper"
                >
                  <img
                    src={`/img/products/${product.image}`}
                    className="d-block h-100 w-100"
                    style={{ objectFit: 'contain' }}
                    alt={product.name}
                  />
                </Link>
                <div className="carousel-caption-strip text-center d-none d-md-block">
                  <h5 className="mb-2">{product.name}</h5>
                  <p className="mb-0">
                    <span className="carousel-price-tag">
                      {formatCurrency(product.price)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#productCarousel"
          data-bs-slide="prev"
        >
          <span
            className="carousel-control-prev-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#productCarousel"
          data-bs-slide="next"
        >
          <span
            className="carousel-control-next-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      {/* Productos Destacados */}
      <h2 className="mb-4">Productos Destacados</h2>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        {featuredProducts.map((product) => (
          <div className="col" key={product.code}>
            <ProductCard
              id={product.code}
              name={product.name}
              description={product.description}
              price={product.price}
              originalPrice={product.originalPrice}
              category={product.category}
              image={`/img/products/${product.image}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useNotification } from '../../hooks/useNotification';
import type { Product } from '../../helpers/api.helper';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { showNotification } = useNotification();

  const { code, name, category, image, description, price, originalPrice } = product;

  const handleAddToCart = () => {
    const itemToAdd = { id: code, name, price, image, quantity: 1 };
    addToCart(itemToAdd);
    showNotification(`'${name}' ha sido añadido al carrito.`, 'success');
  };

  const categoryToClassName = (category: string) => {
    return `badge-${category.toLowerCase().replace(/\s+/g, '-')}`;
  };

  return (
    <div className="card product-card h-100">
      <div className={`card-badge position-absolute ${categoryToClassName(category)}`}>{category}</div>
      <Link to={`/products/${code}`} className="text-decoration-none text-dark">
        <img src={`/img/products/${image}`} className="card-img-top product-img" alt={name} />
      </Link>
      <div className="card-body d-flex flex-column">
        <Link to={`/products/${code}`} className="text-decoration-none text-dark">
          <h5 className="card-title product-title">{name}</h5>
        </Link>
        <p className="card-text product-description">{description}</p>
        <div className="product-price mt-auto">
          <span className="price">${price.toLocaleString('es-CL')}</span>
          {originalPrice && (
            <span className="original-price text-decoration-line-through text-muted ms-2">
              ${originalPrice.toLocaleString('es-CL')}
            </span>
          )}
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <button className="btn btn-primary add-to-cart" onClick={handleAddToCart}>
            <i className="bi bi-cart-plus"></i> Agregar
          </button>
        </div>
      </div>
    </div>
  );
};
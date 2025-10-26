import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  price: number;
  originalPrice?: number;
}

export const ProductCard = ({ id, name, category, image, description, price, originalPrice }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    const itemToAdd = { id, name, price, image };
    addToCart(itemToAdd);
    alert(`'${name}' ha sido añadido al carrito.`);
  };

  return (
    <div className="card product-card h-100">
      <div className="card-badge position-absolute">{category}</div>
      <Link to={`/products/${id}`} className="text-decoration-none text-dark">
        <img src={image} className="card-img-top product-img" alt={name} />
      </Link>
      <div className="card-body d-flex flex-column">
        <Link to={`/products/${id}`} className="text-decoration-none text-dark">
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
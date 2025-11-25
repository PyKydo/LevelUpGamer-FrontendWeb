import { Link } from 'react-router-dom';
import { FaCartPlus } from 'react-icons/fa6';
import styles from './ProductCard.module.css';
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
    const key = category.toLowerCase().replace(/\s+/g, '-');
    switch (key) {
      case 'juegos-de-mesa': return styles.badgeJuegosDeMesa;
      case 'accesorios': return styles.badgeAccesorios;
      case 'consolas': return styles.badgeConsolas;
      case 'computadores-gamers': return styles.badgeComputadoresGamers;
      case 'sillas-gamers': return styles.badgeSillasGamers;
      case 'mouse': return styles.badgeMouse;
      case 'mousepad': return styles.badgeMousepad;
      case 'poleras-personalizadas': return styles.badgePolerasPersonalizadas;
      default: return '';
    }
  };

  return (
    <div className={`h-100 ${styles.productCard}`}>
      <div className={`${styles.cardBadge} position-absolute ${categoryToClassName(category)}`}>{category}</div>
      <Link to={`/products/${code}`} className="text-decoration-none text-dark">
        <img
          src={image.startsWith('http') || image.startsWith('/') ? image : `/img/products/${image}`}
          className={`card-img-top ${styles.productImg}`}
          alt={name}
        />
      </Link>
      <div className={`card-body d-flex flex-column ${styles.productCardBody}`}>
        <Link to={`/products/${code}`} className="text-decoration-none text-dark">
          <h5 className={`card-title ${styles.productTitle}`}>{name}</h5>
        </Link>
        <p className={`card-text ${styles.productDescription}`}>{description}</p>
        <div className={`${styles.productPrice} mt-auto`}>
          <span className="price">${price.toLocaleString('es-CL')}</span>
          {originalPrice && (
            <span className="original-price text-decoration-line-through text-muted ms-2">
              ${originalPrice.toLocaleString('es-CL')}
            </span>
          )}
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <button className={`btn btn-primary add-to-cart ${styles.addToCartBtn}`} onClick={handleAddToCart} aria-label="Agregar al carrito">
            <FaCartPlus size={24} />
            <span className="ms-2">Agregar al Carrito</span>
          </button>
        </div>
      </div>
    </div>
  );
};
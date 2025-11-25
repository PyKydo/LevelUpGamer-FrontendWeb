import { useCart } from '../../hooks/useCart';
import type { CartItem } from '../../hooks/CartContext';
import { IoAddCircle, IoRemoveCircle, IoTrash } from 'react-icons/io5';
import { useMemo, type SyntheticEvent } from 'react';
import styles from './CartItemRow.module.css';

interface CartItemCardProps {
  item: CartItem;
}

export const CartItemRow = ({ item }: CartItemCardProps) => {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const fallbackImage = 'https://placehold.co/200x200?text=Producto';

  const imageSrc = useMemo(() => item.image || fallbackImage, [item.image]);

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = fallbackImage;
  };

  return (
    <div className={`mb-3 bg-dark text-white shadow-sm ${styles.cartItemRow}`}>
      <div className="row g-0">
        <div className="col-md-3 d-flex align-items-center justify-content-center">
          <img
            src={imageSrc}
            className={`img-fluid rounded p-3 ${styles.productImage}`}
            alt={item.name}
            loading="lazy"
            onError={handleImageError}
          />
        </div>
        <div className="col-md-9">
          <div className={`card-body ${styles.cartItemRowBody}`}>
            <div className="d-flex justify-content-between">
              <h5 className="card-title">{item.name}</h5>
              <button
                className={`btn btn-link text-danger ${styles.deleteBtn}`}
                onClick={() => { void removeFromCart(item.productId); }}
                aria-label="Eliminar item"
              >
                <IoTrash size={26} />
              </button>
            </div>
            <p className="card-text mb-2">Precio Unitario: ${item.price.toLocaleString('es-CL')}</p>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <span className="me-3">Cantidad:</span>
                <button
                  className={`btn btn-primary ${styles.quantityBtn}`}
                  onClick={() => { void decreaseQuantity(item.productId); }}
                  aria-label="Disminuir cantidad"
                >
                  <IoRemoveCircle size={24} />
                </button>
                <span className="mx-3" data-testid="quantity">{item.quantity}</span>
                <button
                  className={`btn btn-primary ${styles.quantityBtn}`}
                  onClick={() => { void increaseQuantity(item.productId); }}
                  aria-label="Aumentar cantidad"
                >
                  <IoAddCircle size={24} />
                </button>
              </div>
              <p className="card-text fs-5 fw-bold mb-0">${(item.price * item.quantity).toLocaleString('es-CL')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
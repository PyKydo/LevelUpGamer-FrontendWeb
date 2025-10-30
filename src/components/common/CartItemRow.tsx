import { useCart } from '../../hooks/useCart';
import type { CartItem } from '../../hooks/CartContext';
import styles from './CartItemRow.module.css';

interface CartItemCardProps {
  item: CartItem;
}

export const CartItemRow = ({ item }: CartItemCardProps) => {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart();

  return (
    <div className={`mb-3 bg-dark text-white shadow-sm ${styles.cartItemRow}`}>
      <div className="row g-0">
        <div className="col-md-3 d-flex align-items-center justify-content-center">
          <img src={`/img/products/${item.image}`} className={`img-fluid rounded p-3 ${styles.productImage}`} alt={item.name} />
        </div>
        <div className="col-md-9">
          <div className={`card-body ${styles.cartItemRowBody}`}>
            <div className="d-flex justify-content-between">
              <h5 className="card-title">{item.name}</h5>
              <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)} aria-label="Eliminar item">
                <i className="bi bi-trash"></i>
              </button>
            </div>
            <p className="card-text mb-2">Precio Unitario: ${item.price.toLocaleString('es-CL')}</p>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <span className="me-3">Cantidad:</span>
                <button className={`btn btn-primary ${styles.quantityBtn}`} onClick={() => decreaseQuantity(item.id)}>-</button>
                <span className="mx-3" data-testid="quantity">{item.quantity}</span>
                <button className={`btn btn-primary ${styles.quantityBtn}`} onClick={() => increaseQuantity(item.id)}>+</button>
              </div>
              <p className="card-text fs-5 fw-bold mb-0">${(item.price * item.quantity).toLocaleString('es-CL')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
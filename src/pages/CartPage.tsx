import { useNavigate } from 'react-router-dom';
import { IoCard } from 'react-icons/io5';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { CartItemRow } from '../components/common/CartItemRow';
import styles from './CartPage.module.css';

import { formatCurrency } from '../helpers/formatting.helper';
import { calculateSubtotal, calculateTotal } from '../helpers/cart.helper';

export const CartPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const subtotal = calculateSubtotal(cart);

  const isDuocEmail =
    user?.email.endsWith('@duoc.cl') ||
    user?.email.endsWith('@profesor.duoc.cl');
  const discount = isDuocEmail ? subtotal * 0.2 : 0;

  const finalTotal = calculateTotal(subtotal, discount);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    showNotification('¡Pago realizado exitosamente! Gracias por tu compra.', 'success');

    await clearCart();
  };

  return (
    <main className="container my-5">
      <h1 className="mb-4 text-center">Mi Carrito de Compras</h1>
      <div className="row">
        <div className="col-lg-8">
          {cart.length === 0 ? (
            <div className={styles.summaryCard}>
              <div className={`${styles.summaryCardBody} text-center p-5`}>
                <p className="lead mb-0">El carrito está vacío.</p>
              </div>
            </div>
          ) : (
            cart.map((item) => <CartItemRow key={item.id} item={item} />)
          )}
        </div>
        <div className="col-lg-4 mt-4 mt-lg-0">
          <div className={`bg-dark text-white shadow-sm ${styles.summaryCard}`}>
            <div className={styles.summaryCardBody}>
              <h5 className="card-title mb-4">Resumen del Pedido</h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Descuento:</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
              <hr className="my-3" />
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Total Final:</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>
              <div className="d-grid mt-4">
                <button
                  className="btn btn-primary btn-lg"
                  disabled={cart.length === 0}
                  onClick={handleCheckout}
                  aria-label="Proceder al Pago"
                >
                  <IoCard size={28} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

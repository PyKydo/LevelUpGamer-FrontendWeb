import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoCard } from 'react-icons/io5';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { CartItemRow } from '../components/common/CartItemRow';
import styles from './CartPage.module.css';

import { formatCurrency } from '../helpers/formatting.helper';
import { calculateSubtotal, calculateTotal } from '../helpers/cart.helper';
import { createOrder } from '../helpers/api.helper';

export const CartPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [processingPayment, setProcessingPayment] = useState(false);

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

    if (!cart.length) {
      showNotification('Tu carrito está vacío.', 'error');
      return;
    }

    const clientId = Number(user.id);
    if (Number.isNaN(clientId)) {
      showNotification('No se pudo validar tu sesión. Intenta nuevamente.', 'error');
      return;
    }

    setProcessingPayment(true);
    try {
      const orderPayload = {
        clientId,
        total: Number(finalTotal.toFixed(2)),
        details: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const order = await createOrder(orderPayload);
      await clearCart();

      const orderLabel = order.number ?? order.id;
      showNotification(
        `Pago confirmado. Boleta ${orderLabel} generada correctamente.`,
        'success'
      );
    } catch (error) {
      console.error('No se pudo procesar el pago:', error);
      const backendMessage =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as { response?: { data?: { error?: string; message?: string } } })
          .response?.data?.error;
      showNotification(
        backendMessage ?? 'No se pudo procesar tu pago. Inténtalo más tarde.',
        'error'
      );
    } finally {
      setProcessingPayment(false);
    }
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
                  disabled={cart.length === 0 || processingPayment}
                  onClick={handleCheckout}
                  aria-label="Proceder al Pago"
                >
                  {processingPayment ? 'Procesando...' : <IoCard size={28} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

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
import type { CartItem } from '../hooks/CartContext';

interface CheckoutContext {
  clientId: number;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
}

interface ReceiptData extends CheckoutContext {
  orderLabel: string | number;
}

export const CartPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [processingPayment, setProcessingPayment] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [checkoutContext, setCheckoutContext] = useState<CheckoutContext | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const subtotal = calculateSubtotal(cart);

  const isDuocEmail =
    user?.email.endsWith('@duoc.cl') ||
    user?.email.endsWith('@profesor.duoc.cl');
  const discount = isDuocEmail ? subtotal * 0.2 : 0;

  const finalTotal = calculateTotal(subtotal, discount);

  const handleCheckoutClick = () => {
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

    const snapshotItems = cart.map((item) => ({ ...item }));
    const snapshotSubtotal = calculateSubtotal(snapshotItems);
    const snapshotDiscount = isDuocEmail ? snapshotSubtotal * 0.2 : 0;
    const snapshotTotal = calculateTotal(snapshotSubtotal, snapshotDiscount);

    setCheckoutContext({
      clientId,
      items: snapshotItems,
      subtotal: snapshotSubtotal,
      discount: snapshotDiscount,
      total: snapshotTotal,
    });
    setConfirmModalOpen(true);
  };

  const processCheckout = async () => {
    if (!checkoutContext) {
      setConfirmModalOpen(false);
      return;
    }

    setConfirmModalOpen(false);

    setProcessingPayment(true);
    try {
      const orderPayload = {
        clientId: checkoutContext.clientId,
        total: Number(checkoutContext.total.toFixed(2)),
        details: checkoutContext.items.map((item) => ({
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
      setReceiptData({
        orderLabel,
        items: checkoutContext.items,
        subtotal: checkoutContext.subtotal,
        discount: checkoutContext.discount,
        total: checkoutContext.total,
        clientId: checkoutContext.clientId,
      });
      setReceiptModalOpen(true);
    } catch (error) {
      console.error('No se pudo procesar el pago:', error);
      const backendErrorResponse =
        typeof error === 'object' &&
        error !== null &&
        'response' in error
          ? (error as { response?: { data?: { error?: string; message?: string } } })
              .response?.data
          : undefined;
      const backendMessage =
        backendErrorResponse?.error ?? backendErrorResponse?.message;
      showNotification(
        backendMessage ?? 'No se pudo procesar tu pago. Inténtalo más tarde.',
        'error'
      );
    } finally {
      setProcessingPayment(false);
      setCheckoutContext(null);
    }
  };

  const closeReceiptModal = () => {
    setReceiptModalOpen(false);
    setReceiptData(null);
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
                  onClick={handleCheckoutClick}
                  aria-label="Proceder al Pago"
                >
                  {processingPayment ? 'Procesando...' : <IoCard size={28} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirmModalOpen && checkoutContext && (
        <>
          <div className="modal fade show d-block" role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="modal-dialog">
              <div className={`modal-content bg-dark text-white ${styles.modalContent}`}>
                <div className={`modal-header ${styles.modalHeader}`}>
                  <h5 className="modal-title">Confirmar pago</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={() => {
                      setConfirmModalOpen(false);
                      setCheckoutContext(null);
                    }}
                    disabled={processingPayment}
                  />
                </div>
                <div className="modal-body">
                  <p className="mb-3">
                    Estás a punto de pagar {formatCurrency(checkoutContext.total)} por {checkoutContext.items.length} producto(s).
                  </p>
                  <ul className={styles.receiptList}>
                    <li>
                      <span>Subtotal</span>
                      <span>{formatCurrency(checkoutContext.subtotal)}</span>
                    </li>
                    <li>
                      <span>Descuento DUOC</span>
                      <span>-{formatCurrency(checkoutContext.discount)}</span>
                    </li>
                    <li className={styles.receiptTotal}>
                      <span>Total a pagar</span>
                      <span>{formatCurrency(checkoutContext.total)}</span>
                    </li>
                  </ul>
                  <p className={`mb-0 ${styles.modalBadge}`}>
                    El cobro es simulado y sólo para fines demostrativos.
                  </p>
                </div>
                <div className={`modal-footer ${styles.modalFooter}`}>
                  <button
                    type="button"
                    className="btn btn-outline-light"
                    onClick={() => {
                      setConfirmModalOpen(false);
                      setCheckoutContext(null);
                    }}
                    disabled={processingPayment}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => { void processCheckout(); }}
                    disabled={processingPayment}
                  >
                    {processingPayment ? 'Procesando...' : 'Confirmar y pagar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {receiptModalOpen && receiptData && (
        <>
          <div className="modal fade show d-block" role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className={`modal-content bg-dark text-white ${styles.modalContent}`}>
                <div className={`modal-header ${styles.modalHeader}`}>
                  <h5 className="modal-title">Resumen de boleta</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={closeReceiptModal}
                  />
                </div>
                <div className="modal-body">
                  <div className={styles.receiptCard}>
                    <p className="mb-1">Boleta</p>
                    <h4 className="mb-3">{receiptData.orderLabel}</h4>
                    <div className="mb-3">
                      <small className={styles.modalBadge}>Cliente ID</small>
                      <p className="mb-0">#{receiptData.clientId}</p>
                    </div>
                    <ul className={`${styles.receiptList} mb-3`}>
                      {receiptData.items.map((item) => (
                        <li key={`${item.productId}-${item.id}`}>
                          <span>
                            {item.name}
                            <small className={`d-block ${styles.modalBadge}`}>
                              Cantidad: {item.quantity}
                            </small>
                          </span>
                          <span>{formatCurrency(item.price * item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                    <ul className={styles.receiptList}>
                      <li>
                        <span>Subtotal</span>
                        <span>{formatCurrency(receiptData.subtotal)}</span>
                      </li>
                      <li>
                        <span>Descuento</span>
                        <span>-{formatCurrency(receiptData.discount)}</span>
                      </li>
                      <li className={styles.receiptTotal}>
                        <span>Total pagado</span>
                        <span>{formatCurrency(receiptData.total)}</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className={`modal-footer ${styles.modalFooter}`}>
                  <button type="button" className="btn btn-primary" onClick={closeReceiptModal}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </main>
  );
};

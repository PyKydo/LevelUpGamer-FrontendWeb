import { useCart } from '../hooks/useCart';
import { CartItemRow } from '../components/common/CartItemRow';

export const CartPage = () => {
  const { cart } = useCart();

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const discount = 0; // Placeholder
  const finalTotal = subtotal - discount;

  return (
    <main className="container my-5">
      <h1 className="mb-4 text-center">Mi Carrito de Compras</h1>
      <div className="row">
        <div className="col-lg-8">
          {cart.length === 0 ? (
            <div className="card bg-dark text-white shadow-sm">
              <div className="card-body text-center p-5">
                <p className="lead mb-0">El carrito está vacío.</p>
              </div>
            </div>
          ) : (
            cart.map(item => (
              <CartItemRow key={item.id} item={item} />
            ))
          )}
        </div>
        <div className="col-lg-4">
          <div className="card bg-dark text-white shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">Resumen del Pedido</h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString('es-CL')}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Descuento:</span>
                <span>-${discount.toLocaleString('es-CL')}</span>
              </div>
              <hr className="my-3" />
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Total Final:</span>
                <span>${finalTotal.toLocaleString('es-CL')}</span>
              </div>
              <div className="d-grid mt-4">
                <button className="btn btn-primary btn-lg" disabled={cart.length === 0}>
                  Proceder al Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
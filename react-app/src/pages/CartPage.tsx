import { useCart } from '../hooks/useCart';

export const CartPage = () => {
  const { cart, removeFromCart } = useCart();

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Lógica de descuento (placeholder por ahora)
  const discount = 0; 
  const finalTotal = subtotal - discount;

  return (
    <main className="container my-5">
      <h1 className="mb-4 text-center">Mi Carrito de Compras</h1>
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-dark table-striped table-hover align-middle rounded-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Producto</th>
                  <th>Precio Unitario</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody id="cart-items">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">El carrito está vacío.</td>
                  </tr>
                ) : (
                  cart.map(item => (
                    <tr key={item.id}>
                      <td><img src={item.image} alt={item.name} style={{ width: '50px' }} /></td>
                      <td>{item.name}</td>
                      <td>${item.price.toLocaleString('es-CL')}</td>
                      <td>{item.quantity}</td>
                      <td>${(item.price * item.quantity).toLocaleString('es-CL')}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} className="text-end"><strong>Subtotal:</strong></td>
                  <td>${subtotal.toLocaleString('es-CL')}</td>
                </tr>
                <tr>
                  <td colSpan={5} className="text-end"><strong>Descuento:</strong></td>
                  <td>-${discount.toLocaleString('es-CL')}</td>
                </tr>
                <tr>
                  <td colSpan={5} className="text-end"><strong>Total Final:</strong></td>
                  <td>${finalTotal.toLocaleString('es-CL')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
            <button className="btn btn-primary btn-lg" disabled={cart.length === 0}>
              Proceder al Pago
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
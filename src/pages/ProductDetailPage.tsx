import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { getProductById, type Product } from '../helpers/api.helper';
import { formatCurrency } from '../helpers/formatting.helper';

export const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const foundProduct = await getProductById(productId);
          setProduct(foundProduct || null);
        } catch (error) {
          console.error('Failed to fetch product:', error);
          setProduct(null);
        }
      };
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    const itemToAdd = {
      id: product.code,
      name: product.name,
      price: product.price,
      image: `/img/products/${product.image}`,
    };
    addToCart(itemToAdd);
    alert(`'${product.name}' ha sido añadido al carrito.`);
  };

  if (!product) {
    return (
      <div className="container my-5 text-center">
        <h2>Producto no encontrado</h2>
      </div>
    );
  }

  return (
    <main className="container my-5">
      <div className="row">
        <div className="col-md-6">
          <img
            src={`/img/products/${product.image}`}
            className="img-fluid rounded shadow-sm"
            alt={product.name}
          />
        </div>
        <div className="col-md-6">
          <h2>{product.name}</h2>
          <p className="lead">{product.description}</p>
          <h3 className="my-4">{formatCurrency(product.price)}</h3>
          <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
            <i className="bi bi-cart-plus"></i> Añadir al Carrito
          </button>
        </div>
      </div>
    </main>
  );
};

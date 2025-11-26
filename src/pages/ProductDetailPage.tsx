import { useState, useEffect } from 'react';
import type { SyntheticEvent } from 'react';
import { useParams } from 'react-router-dom';
import { IoCart } from 'react-icons/io5';
import { useCart } from '../hooks/useCart';
import { useNotification } from '../hooks/useNotification';
import { ProductReviews } from '../components/products/ProductReviews';
import { getProductById, type Product } from '../helpers/api.helper';
import { formatCurrency } from '../helpers/formatting.helper';
import { reportError } from '../helpers/logging.helper';

export const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  const isInactive = product?.active === false;
  const isOutOfStock = typeof product?.stock === 'number' ? product.stock <= 0 : false;
  const isUnavailable = isInactive || isOutOfStock;

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      if (!productId) {
        setError('Producto no encontrado.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const foundProduct = await getProductById(productId);
        if (!isMounted) return;
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          setProduct(null);
          setError('Producto no encontrado.');
        }
      } catch (error) {
        reportError('ProductDetailPage:fetchProduct', error);
        if (isMounted) {
          setError('No se pudo cargar la información del producto.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (typeof product.id !== 'number') {
      showNotification('No se pudo identificar el producto seleccionado.', 'error');
      return;
    }

    if (isUnavailable) {
      const reason = isInactive
        ? 'Este producto ya no está disponible para la venta.'
        : 'El producto está sin stock por ahora.';
      showNotification(reason, 'error');
      return;
    }

    const itemToAdd = {
      id: product.code,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    };

    await addToCart(itemToAdd);
    showNotification(`'${product.name}' ha sido añadido al carrito.`, 'success');
  };

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = 'https://placehold.co/600x600?text=Producto';
  };

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border" role="status" aria-label="Cargando producto" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container my-5 text-center">
        <h2>{error ?? 'Producto no encontrado'}</h2>
      </div>
    );
  }

  return (
    <main className="container my-5">
      <div className="row">
        <div className="col-md-6">
          <img
            src={product.image || 'https://placehold.co/600x600?text=Producto'}
            className="img-fluid rounded shadow-sm"
            alt={product.name}
            onError={handleImageError}
          />
        </div>
        <div className="col-md-6">
          <h2>{product.name}</h2>
          <p className="lead">{product.description}</p>
          <h3 className="my-4">{formatCurrency(product.price)}</h3>
          {isUnavailable && (
            <div className="alert alert-warning" role="status">
              {isInactive
                ? 'Este producto fue retirado del catálogo.'
                : 'Producto sin stock disponible por el momento.'}
            </div>
          )}
          <button
            className="btn btn-primary btn-lg"
            onClick={handleAddToCart}
            disabled={isUnavailable}
          >
            <IoCart /> {isUnavailable ? 'No disponible' : 'Añadir al Carrito'}
          </button>
        </div>
      </div>
      <ProductReviews productId={product.id} productName={product.name} />
    </main>
  );
};

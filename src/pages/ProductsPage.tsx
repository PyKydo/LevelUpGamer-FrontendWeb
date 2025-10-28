import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/common/ProductCard';
import { getProducts, type Product } from '../helpers/api.helper';
import { useSearch } from '../hooks/useSearch';

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchParams] = useSearchParams();
  const { searchTerm, setSearchTerm } = useSearch();

  useEffect(() => {
    setProducts(getProducts());
    const query = searchParams.get('q') || '';
    setSearchTerm(query);
  }, [searchParams, setSearchTerm]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">Catálogo de Productos</h1>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div className="col" key={product.code}>
              <ProductCard product={product} />
            </div>
          ))
        ) : (
          <div className="col-12">
            <p className="text-center">
              No se encontraron productos para "{searchTerm}".
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

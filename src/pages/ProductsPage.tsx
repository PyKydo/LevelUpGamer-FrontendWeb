import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/common/ProductCard';
import { FormFloating } from '../components/common/FormFloating';
import { FormSelect } from '../components/common/FormSelect';
import { getProducts, type Product } from '../helpers/api.helper';
import { useSearch } from '../hooks/useSearch';
import { reportError } from '../helpers/logging.helper';

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [searchParams] = useSearchParams();
  const { searchTerm, setSearchTerm } = useSearch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        reportError('ProductsPage:fetchProducts', error);
      }
    };
    fetchProducts();

    const query = searchParams.get('q') || '';
    setSearchTerm(query);
  }, [searchParams, setSearchTerm]);

  const categories = useMemo(() => {
    const allCategories = products.map((p) => p.category);
    return Array.from(new Set(allCategories)).filter(Boolean);
  }, [products]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPriceRange((prev) => ({ ...prev, [name]: value }));
  };

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter(
      (product) =>
        !selectedCategory || product.category === selectedCategory,
    )
    .filter((product) => {
      const minPrice = parseFloat(priceRange.min);
      const maxPrice = parseFloat(priceRange.max);
      if (!isNaN(minPrice) && product.price < minPrice) {
        return false;
      }
      if (!isNaN(maxPrice) && product.price > maxPrice) {
        return false;
      }
      return true;
    });

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">Catálogo de Productos</h1>

      <div className="row mb-4 g-3">
        <div className="col-md-4">
          <FormSelect
            id="category"
            label="Categoría"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { value: '', label: 'Todas las categorías' },
              ...categories.map((category) => ({ value: category, label: category })),
            ]}
            floating
          />
        </div>
        <div className="col-md-4">
          <FormFloating
            type="number"
            name="min"
            id="minPrice"
            label="Precio Mínimo"
            placeholder="Precio Mínimo"
            value={priceRange.min}
            onChange={handlePriceChange}
          />
        </div>
        <div className="col-md-4">
          <FormFloating
            type="number"
            name="max"
            id="maxPrice"
            label="Precio Máximo"
            placeholder="Precio Máximo"
            value={priceRange.max}
            onChange={handlePriceChange}
          />
        </div>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <div className="col" key={`${product.code}-${index}`}>
              <ProductCard product={product} />
            </div>
          ))
        ) : (
          <div className="col-12">
            <p className="text-center">
              No se encontraron productos para los filtros seleccionados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

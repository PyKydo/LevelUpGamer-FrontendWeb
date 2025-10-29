import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/common/ProductCard';
import { getProducts, type Product } from '../helpers/api.helper';
import { useSearch } from '../hooks/useSearch';

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [searchParams] = useSearchParams();
  const { searchTerm, setSearchTerm } = useSearch();

  useEffect(() => {
    setProducts(getProducts());
    const query = searchParams.get('q') || '';
    setSearchTerm(query);
  }, [searchParams, setSearchTerm]);

  const categories = useMemo(() => {
    const allCategories = products.map((p) => p.category);
    return ['', ...Array.from(new Set(allCategories))];
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
          <div className="form-floating">
            <select
              className="form-select"
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <label htmlFor="category">Categoría</label>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-floating">
            <input
              type="number"
              name="min"
              id="minPrice"
              className="form-control"
              placeholder="Precio Mínimo"
              value={priceRange.min}
              onChange={handlePriceChange}
            />
            <label htmlFor="minPrice">Precio Mínimo</label>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-floating">
            <input
              type="number"
              name="max"
              id="maxPrice"
              className="form-control"
              placeholder="Precio Máximo"
              value={priceRange.max}
              onChange={handlePriceChange}
            />
            <label htmlFor="maxPrice">Precio Máximo</label>
          </div>
        </div>
      </div>

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
              No se encontraron productos para los filtros seleccionados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

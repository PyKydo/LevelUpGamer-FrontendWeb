import { useState, useEffect } from 'react';
import { ProductCard } from '../components/common/ProductCard';
import productsData from '../data/products.json';

// Definir el tipo para un producto, basado en la estructura del JSON
interface Product {
  code: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
  image: string;
}

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // En una aplicación real, aquí se haría una llamada a una API.
    // Por ahora, cargamos los datos desde el archivo JSON importado.
    setProducts(productsData as Product[]);
  }, []);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">Catálogo de Productos</h1>
      <div className="row mb-4">
        <div className="col-md-6 mx-auto">
          <input 
            type="text"
            className="form-control"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {filteredProducts.map((product) => (
          <div className="col" key={product.code}>
            <ProductCard 
              id={product.code}
              name={product.name}
              description={product.description}
              price={product.price}
              originalPrice={product.originalPrice}
              category={product.category}
              image={`/img/products/${product.image}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
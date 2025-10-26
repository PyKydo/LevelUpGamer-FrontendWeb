import { useState, useEffect } from 'react';
import { ProductCard } from '../components/common/ProductCard';
import productsData from '../data/products.json';

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

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Seleccionamos algunos productos para destacar (ej. los primeros 4)
    setFeaturedProducts((productsData as Product[]).slice(0, 4));
  }, []);

  return (
    <div className="container my-5">
      <div className="text-center mb-5">
        <h1>Bienvenidos a Level-Up Gamer</h1>
        <p className="lead">Tu tienda de confianza para todo lo relacionado con gaming en Chile.</p>
      </div>
      
      <h2 className="mb-4">Productos Destacados</h2>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        {featuredProducts.map((product) => (
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
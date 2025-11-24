
import productsData from '../data/products.json';
import { Carousel } from '../components/common/Carousel';
import { ProductCard } from '../components/common/ProductCard';

export const HomePage = () => {


  const carouselProducts = productsData.slice(0, 3);
  const featuredProducts = productsData.slice(0, 4);



  return (
    <main className="flex-grow-1 py-4">
      <div className="container">
        <Carousel products={carouselProducts} />

        <h2 className="text-center mb-4">Productos Destacados</h2>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {featuredProducts.map((product) => (
            <div className="col" key={product.code}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};


import productsData from '../data/products.json';
import blogsData from '../data/blogs.json';
import { Carousel } from '../components/common/Carousel';
import { ProductCard } from '../components/common/ProductCard';
import { BlogCard } from '../components/common/BlogCard';

export const HomePage = () => {


  const carouselProducts = productsData.slice(0, 3);
  const featuredProducts = productsData.slice(0, 4);
  const featuredBlogs = blogsData.slice(0, 3);



  return (
    <main className="flex-grow-1 py-4">
      <div className="container">
        <Carousel products={carouselProducts} />

        {/* Sección de Blogs Destacados */}
        <h2 className="text-center mb-4 mt-5">Blogs Destacados</h2>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-5">
          {featuredBlogs.map((blog) => (
            <div className="col" key={blog.id}>
              <BlogCard
                id={blog.id}
                img={blog.image}
                title={blog.title}
                excerpt={blog.summary}
              />
            </div>
          ))}
        </div>

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

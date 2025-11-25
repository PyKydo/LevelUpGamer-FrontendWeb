
import { useState, useEffect } from 'react';
import { getProducts, getBlogPosts, type Product, type Blog } from '../helpers/api.helper';
import { Carousel } from '../components/common/Carousel';
import { ProductCard } from '../components/common/ProductCard';
import { BlogCard } from '../components/common/BlogCard';

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [carouselProducts, setCarouselProducts] = useState<Product[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const products = await getProducts();
      const blogs = await getBlogPosts();

      setCarouselProducts(products.slice(0, 3));
      setFeaturedProducts(products.slice(0, 4));
      setFeaturedBlogs(blogs.slice(0, 3));
    };
    fetchData();
  }, []);



  return (
    <main className="flex-grow-1 py-4">
      <div className="container">
        <Carousel products={carouselProducts} />

        {/* Sección de Blogs Destacados */}
        <h2 className="text-center mb-4 mt-5">Blogs Destacados</h2>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-5">
          {featuredBlogs.map((blog, index) => (
            <div className="col" key={`${blog.id}-${index}`}>
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
          {featuredProducts.map((product, index) => (
            <div className="col" key={`${product.code}-${index}`}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

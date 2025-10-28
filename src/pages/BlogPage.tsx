import { useState, useEffect } from 'react';
import { BlogCard } from '../components/common/BlogCard';
import { getBlogPosts, type Blog } from '../helpers/api.helper';

export const BlogPage = () => {
  const [posts, setPosts] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const data = await getBlogPosts();
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
      }
    };
    fetchBlogPosts();
  }, []);

  return (
    <main className="container py-5">
      <h1 className="mb-4 text-center">Blogs</h1>
      <div className="row g-4">
        {posts.map((post) => (
          <div className="col-md-6 col-lg-4" key={post.id}>
            <BlogCard
              id={post.id}
              img={post.image}
              title={post.title}
              excerpt={post.summary}
            />
          </div>
        ))}
      </div>
    </main>
  );
};

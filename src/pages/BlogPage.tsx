import { useState, useEffect } from 'react';
import { BlogCard } from '../components/common/BlogCard';
import { getBlogPosts, type Blog } from '../helpers/api.helper';

export const BlogPage = () => {
  const [posts, setPosts] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await getBlogPosts();
      setPosts(data);
    };
    fetchPosts();
  }, []);

  return (
    <main className="container py-5">
      <h1 className="mb-4 text-center">Blogs</h1>
      <div className="row g-4">
        {posts.map((post, index) => (
          <div className="col-md-6 col-lg-4" key={`${post.id}-${index}`}>
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

import { useState, useEffect } from 'react';
import { BlogCard } from '../components/common/BlogCard';
import blogsData from '../data/blogs.json';

interface Blog {
  id: string;
  title: string;
  image: string;
  alt: string;
  summary: string;
  content: string;
}

export const BlogPage = () => {
  const [posts, setPosts] = useState<Blog[]>([]);

  useEffect(() => {
    setPosts(blogsData as Blog[]);
  }, []);

  return (
    <main className="container py-5">
      <h1 className="mb-4 text-center">Nuestro Blog</h1>
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
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import blogsData from '../data/blogs.json';

interface Blog {
  id: string;
  title: string;
  image: string;
  alt: string;
  summary: string;
  content: string;
}

export const BlogDetailPage = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const [post, setPost] = useState<Blog | null>(null);

  useEffect(() => {
    const foundPost = blogsData.find(p => p.id === blogId) as Blog | undefined;
    setPost(foundPost || null);
  }, [blogId]);

  if (!post) {
    return <div className="container my-5 text-center"><h2>Entrada de blog no encontrada</h2></div>;
  }

  return (
    <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="mb-4">{post.title}</h1>
          <img src={post.image} className="img-fluid rounded shadow-sm mb-4 blog-detail-img" alt={post.alt} />
          <p className="lead">{post.content}</p>
        </div>
      </div>
    </main>
  );
};
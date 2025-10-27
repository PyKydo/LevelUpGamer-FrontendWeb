import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import blogsData from '../data/blogs.json';

interface Blog {
  id: string;
  title: string;
  image: string;
  alt: string;
  summary: string;
  author: string;
  date: string;
  content_path: string;
}

export const BlogDetailPage = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const [post, setPost] = useState<Blog | null>(null);
  const [markdownContent, setMarkdownContent] = useState('');

  // Efecto para encontrar los metadatos del post
  useEffect(() => {
    const foundPost = blogsData.find(p => p.id === blogId) as Blog | undefined;
    setPost(foundPost || null);
  }, [blogId]);

  // Efecto para cargar el contenido del archivo .md cuando se encuentra el post
  useEffect(() => {
    if (post && post.content_path) {
      fetch(post.content_path)
        .then(response => response.text())
        .then(text => setMarkdownContent(text))
        .catch(error => console.error('Error fetching blog content:', error));
    }
  }, [post]);

  if (!post) {
    return <div className="container my-5 text-center"><h2>Entrada de blog no encontrada</h2></div>;
  }

  return (
    <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="mb-3">{post.title}</h1>
          <div className="text-muted mb-3">
            <span>Por {post.author}</span> | <span>{new Date(post.date).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="blog-detail-img-wrapper mb-4">
            <img src={post.image} className="img-fluid" alt={post.alt} />
          </div>
          <div className="lead">
            <ReactMarkdown>{markdownContent}</ReactMarkdown>
          </div>
        </div>
      </div>
    </main>
  );
};
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  getBlogPostById,
  getBlogContent,
  type Blog,
} from '../helpers/api.helper';
import { formatDate } from '../helpers/formatting.helper';

export const BlogDetailPage = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const [post, setPost] = useState<Blog | null>(null);
  const [markdownContent, setMarkdownContent] = useState('');

  useEffect(() => {
    if (blogId) {
      const fetchPostDetails = async () => {
        try {
          const foundPost = await getBlogPostById(blogId);
          setPost(foundPost || null);

          if (foundPost && foundPost.content_path) {
            const content = await getBlogContent(foundPost.content_path);
            setMarkdownContent(content);
          }
        } catch (error) {
          console.error('Failed to fetch blog details:', error);
          setPost(null);
        }
      };

      fetchPostDetails();
    }
  }, [blogId]);

  if (!post) {
    return (
      <div className="container my-5 text-center">
        <h2>Entrada de blog no encontrada</h2>
      </div>
    );
  }

  return (
    <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="mb-3">{post.title}</h1>
          <div className="text-muted mb-3">
            <span>Por {post.author}</span> | <span>{formatDate(post.date)}</span>
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

import { useState, useEffect, type HTMLAttributes, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './BlogDetailPage.module.css';
import {
  getBlogPostById,
  getBlogContent,
  type Blog,
} from '../helpers/api.helper';
import { formatDate } from '../helpers/formatting.helper';
import { reportError } from '../helpers/logging.helper';

type MarkdownCodeProps = HTMLAttributes<HTMLElement> & {
  inline?: boolean;
  children?: ReactNode;
};

export const BlogDetailPage = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const [post, setPost] = useState<Blog | null>(null);
  const [markdownContent, setMarkdownContent] = useState('');
  const [postError, setPostError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);

  const markdownComponents: Components = {
    table: (props) => (
      <div className={styles.tableWrapper}>
        <table className={styles.table} {...props} />
      </div>
    ),
    th: (props) => <th {...props} />,
    td: (props) => <td {...props} />,
    blockquote: (props) => <blockquote className={styles.blockquote} {...props} />,
    code: ({ inline, className, children, ...rest }: MarkdownCodeProps) => {
      if (inline) {
        return (
          <code className={styles.inlineCode} {...rest}>
            {children}
          </code>
        );
      }
      return (
        <pre className={styles.codeBlock}>
          <code className={className} {...rest}>
            {children}
          </code>
        </pre>
      );
    },
    img: ({ alt, ...props }) => (
      <img className={styles.contentImage} alt={alt} loading="lazy" {...props} />
    ),
    a: ({ children, ...props }) => (
      <a
        className={styles.link}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),
  };

  useEffect(() => {
    let isMounted = true;
    const fetchPost = async () => {
      setLoadingPost(true);
      setPostError(null);
      setPost(null);
      setMarkdownContent('');
      setContentError(null);

      if (!blogId) {
        setLoadingPost(false);
        setPostError('Identificador de blog inválido.');
        return;
      }

      try {
        const foundPost = await getBlogPostById(blogId);
        if (!isMounted) return;
        if (!foundPost) {
          setPostError('Entrada de blog no encontrada.');
        }
        setPost(foundPost || null);
      } catch (error) {
        reportError('BlogDetailPage:fetchPost', error);
        if (isMounted) {
          setPostError('No se pudo cargar esta publicación.');
        }
      } finally {
        if (isMounted) {
          setLoadingPost(false);
        }
      }
    };

    fetchPost();

    return () => {
      isMounted = false;
    };
  }, [blogId]);

  useEffect(() => {
    let isMounted = true;
    const fetchContent = async () => {
      if (!post?.id) {
        return;
      }
      setLoadingContent(true);
      setContentError(null);
      setMarkdownContent('');
      try {
        const content = await getBlogContent(post.id, post.content_path);
        if (isMounted) {
          setMarkdownContent(content);
        }
      } catch (error) {
        reportError('BlogDetailPage:fetchContent', error);
        if (isMounted) {
          setContentError('No se pudo cargar el contenido del blog.');
        }
      } finally {
        if (isMounted) {
          setLoadingContent(false);
        }
      }
    };

    fetchContent();

    return () => {
      isMounted = false;
    };
  }, [post?.id, post?.content_path]);

  if (loadingPost) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border" role="status" aria-label="Cargando publicación" />
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="container my-5 text-center">
        <h2>{postError ?? 'Entrada de blog no encontrada'}</h2>
      </div>
    );
  }

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = 'https://placehold.co/1200x600?text=Blog';
  };

  return (
    <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="mb-3">{post.title}</h1>
          <div className="text-muted mb-3">
            <span>Por {post.author}</span> | <span>{formatDate(post.date)}</span>
          </div>
          <div className={`mb-4 ${styles.blogDetailImgWrapper}`}>
            <img
              src={post.image}
              className="img-fluid"
              alt={post.alt}
              onError={handleImageError}
            />
          </div>
          <div className="lead">
            {loadingContent && (
              <p className="text-muted">Cargando contenido...</p>
            )}
            {contentError && (
              <p className="text-danger">{contentError}</p>
            )}
            {!loadingContent && !contentError && (
              <div className={styles.blogContent}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {markdownContent}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

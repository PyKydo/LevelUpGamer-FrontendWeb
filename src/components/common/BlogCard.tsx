import { Link } from 'react-router-dom';
import styles from './BlogCard.module.css';

interface BlogCardProps {
  id: string; 
  img: string;
  title: string;
  excerpt: string;
}

export const BlogCard = ({ id, img, title, excerpt }: BlogCardProps) => {
  return (
    <Link to={`/blog/${id}`} className={`card h-100 text-decoration-none text-white ${styles.blogCard}`}>
      <img src={img} className={`card-img-top ${styles.blogImg}`} alt={title} />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title blog-title">{title}</h5>
        <p className={`card-text ${styles.blogExcerpt}`}>{excerpt}</p>
        <span className="btn btn-primary mt-auto btn-leer-mas">Leer más</span>
      </div>
    </Link>
  );
};
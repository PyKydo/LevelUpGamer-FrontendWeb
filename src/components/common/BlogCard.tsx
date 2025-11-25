import { Link } from 'react-router-dom';
import { FaReadme } from 'react-icons/fa';
import styles from './BlogCard.module.css';

interface BlogCardProps {
  id: string;
  img: string;
  title: string;
  excerpt: string;
}

export const BlogCard = ({ id, img, title, excerpt }: BlogCardProps) => {
  return (
    <div className={`h-100 text-decoration-none text-white ${styles.blogCard}`}>
      <Link to={`/blog/${id}`} className="text-decoration-none text-white">
        <img src={img} className={`card-img-top ${styles.blogImg}`} alt={title} />
        <div className={`card-body d-flex flex-column ${styles.blogCardBody}`}>
          <h5 className={`card-title ${styles.blogTitle}`}>{title}</h5>
          <p className={`card-text ${styles.blogExcerpt}`}>{excerpt}</p>

          <span className="btn btn-primary mt-auto btn-leer-mas">
            <FaReadme size={20} />
            <span className="ms-2">Leer más</span>
          </span>
        </div>
      </Link>
    </div>
  );
};
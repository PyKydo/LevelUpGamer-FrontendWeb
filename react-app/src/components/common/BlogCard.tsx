import { Link } from 'react-router-dom';

interface BlogCardProps {
  id: string; // Añadir id para el enlace
  img: string;
  title: string;
  excerpt: string;
}

export const BlogCard = ({ id, img, title, excerpt }: BlogCardProps) => {
  return (
    <Link to={`/blog/${id}`} className="card blog-card h-100 text-decoration-none text-white">
      <img src={img} className="card-img-top blog-img" alt={title} />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title blog-title">{title}</h5>
        <p className="card-text blog-excerpt">{excerpt}</p>
        <span className="btn btn-primary mt-auto btn-leer-mas">Leer más</span>
      </div>
    </Link>
  );
};
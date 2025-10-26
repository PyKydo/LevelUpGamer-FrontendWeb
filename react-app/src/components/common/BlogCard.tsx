interface BlogCardProps {
  img: string;
  title: string;
  excerpt: string;
}

export const BlogCard = ({ img, title, excerpt }: BlogCardProps) => {
  return (
    <div className="card blog-card h-100">
      <img src={img} className="card-img-top blog-img" alt={title} />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title blog-title">{title}</h5>
        <p className="card-text blog-excerpt">{excerpt}</p>
        <button className="btn btn-primary mt-auto btn-leer-mas" type="button">Leer más</button>
      </div>
    </div>
  );
};
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../helpers/formatting.helper';
import styles from './Carousel.module.css';

interface Product {
    code: string;
    name: string;
    image: string;
    price: number;
}

interface CarouselProps {
    products: Product[];
}

export const Carousel = ({ products }: CarouselProps) => {
    return (
        <div
            id="productCarousel"
            className={`carousel slide mb-5 ${styles.productCarousel}`}
            data-bs-ride="carousel"
        >
            <div className="carousel-inner">
                {products.map((product, index) => (
                    <div
                        className={`carousel-item ${styles.carouselItem} ${index === 0 ? 'active' : ''}`}
                        key={product.code}
                    >
                        <div
                            className="d-flex justify-content-center align-items-center"
                            style={{ height: '400px', backgroundColor: 'white' }}
                        >
                            <Link
                                to={`/products/${product.code}`}
                                className={`d-block h-100 w-100 text-decoration-none ${styles.carouselImageWrapper}`}
                            >
                                <img
                                    src={`/img/products/${product.image}`}
                                    className="d-block h-100 w-100"
                                    style={{ objectFit: 'contain' }}
                                    alt={product.name}
                                />
                            </Link>
                            <div className={`text-center d-none d-md-block ${styles.carouselCaptionStrip}`}>
                                <h5 className="mb-2">{product.name}</h5>
                                <p className="mb-0">
                                    <span className={styles.carouselPriceTag}>
                                        {formatCurrency(product.price)}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#productCarousel"
                data-bs-slide="prev"
            >
                <span
                    className={`carousel-control-prev-icon ${styles.carouselControlPrevIcon}`}
                    aria-hidden="true"
                ></span>
                <span className="visually-hidden">Previous</span>
            </button>
            <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#productCarousel"
                data-bs-slide="next"
            >
                <span
                    className={`carousel-control-next-icon ${styles.carouselControlNextIcon}`}
                    aria-hidden="true"
                ></span>
                <span className="visually-hidden">Next</span>
            </button>
        </div>
    );
};

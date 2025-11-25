import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getProducts, type Product } from '../../helpers/api.helper';
import { Link } from 'react-router-dom';

export const SellerDashboard = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (error) {
                console.error('Error loading products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Panel de Ventas</h1>
                <span className="badge bg-secondary">Vendedor: {user?.name}</span>
            </div>

            <div className="row">
                <div className="col-12 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <h2 className="h5 mb-0">Inventario de Productos</h2>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Imagen</th>
                                                <th>Código</th>
                                                <th>Nombre</th>
                                                <th>Categoría</th>
                                                <th>Precio</th>
                                                <th>Stock</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map((product) => (
                                                <tr key={product.code}>
                                                    <td>
                                                        <img
                                                            src={`/img/products/${product.image}`}
                                                            alt={product.name}
                                                            width="50"
                                                            height="50"
                                                            className="object-fit-contain"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'https://placehold.co/50x50?text=No+Img';
                                                            }}
                                                        />
                                                    </td>
                                                    <td>{product.code}</td>
                                                    <td>{product.name}</td>
                                                    <td>
                                                        <span className="badge bg-info text-dark">{product.category}</span>
                                                    </td>
                                                    <td>${product.price.toLocaleString('es-CL')}</td>
                                                    <td>
                                                        <span className={`badge ${product.stock < 5 ? 'bg-danger' : 'bg-success'}`}>
                                                            {product.stock}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <Link to={`/products/${product.code}`} className="btn btn-sm btn-outline-primary">
                                                            Ver Detalle
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-header bg-success text-white">
                            <h2 className="h5 mb-0">Órdenes (Boletas)</h2>
                        </div>
                        <div className="card-body">
                            <div className="alert alert-info">
                                La funcionalidad de listar todas las órdenes está en desarrollo.
                                <br />
                                Puede consultar órdenes específicas por ID de usuario si es necesario.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

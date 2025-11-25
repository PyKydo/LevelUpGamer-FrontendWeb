import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { FaUsers, FaBoxOpen, FaNewspaper, FaChartLine } from 'react-icons/fa6';

export const AdminDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h1 className="display-5 fw-bold">Panel de Administración</h1>
                    <p className="text-muted lead">Bienvenido, {user?.name}. Tienes acceso total al sistema.</p>
                </div>
                <span className="badge bg-danger fs-6">ADMINISTRADOR</span>
            </div>

            <div className="row g-4">
                {/* Gestión de Usuarios */}
                <div className="col-md-6 col-lg-3">
                    <div className="card h-100 shadow-sm border-0 hover-card">
                        <div className="card-body text-center py-5">
                            <div className="icon-circle bg-primary bg-opacity-10 text-primary mb-3 mx-auto d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', borderRadius: '50%' }}>
                                <FaUsers size={40} />
                            </div>
                            <h3 className="h5 card-title">Usuarios</h3>
                            <p className="card-text text-muted small">Gestionar clientes, vendedores y administradores.</p>
                            <button className="btn btn-outline-primary w-100 mt-3" disabled>Gestionar (Pronto)</button>
                        </div>
                    </div>
                </div>

                {/* Gestión de Productos */}
                <div className="col-md-6 col-lg-3">
                    <div className="card h-100 shadow-sm border-0 hover-card">
                        <div className="card-body text-center py-5">
                            <div className="icon-circle bg-success bg-opacity-10 text-success mb-3 mx-auto d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', borderRadius: '50%' }}>
                                <FaBoxOpen size={40} />
                            </div>
                            <h3 className="h5 card-title">Productos</h3>
                            <p className="card-text text-muted small">Agregar, editar o eliminar productos del catálogo.</p>
                            <Link to="/seller" className="btn btn-outline-success w-100 mt-3">Ver Inventario</Link>
                        </div>
                    </div>
                </div>

                {/* Gestión de Blogs */}
                <div className="col-md-6 col-lg-3">
                    <div className="card h-100 shadow-sm border-0 hover-card">
                        <div className="card-body text-center py-5">
                            <div className="icon-circle bg-warning bg-opacity-10 text-warning mb-3 mx-auto d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', borderRadius: '50%' }}>
                                <FaNewspaper size={40} />
                            </div>
                            <h3 className="h5 card-title">Blogs</h3>
                            <p className="card-text text-muted small">Publicar noticias y novedades para la comunidad.</p>
                            <button className="btn btn-outline-warning w-100 mt-3" disabled>Gestionar (Pronto)</button>
                        </div>
                    </div>
                </div>

                {/* Reportes / Ventas */}
                <div className="col-md-6 col-lg-3">
                    <div className="card h-100 shadow-sm border-0 hover-card">
                        <div className="card-body text-center py-5">
                            <div className="icon-circle bg-info bg-opacity-10 text-info mb-3 mx-auto d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', borderRadius: '50%' }}>
                                <FaChartLine size={40} />
                            </div>
                            <h3 className="h5 card-title">Ventas</h3>
                            <p className="card-text text-muted small">Revisar historial de órdenes y métricas.</p>
                            <Link to="/seller" className="btn btn-outline-info w-100 mt-3">Ver Ventas</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

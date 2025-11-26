import type { SyntheticEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getProducts, type Product } from '../../helpers/api.helper';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaFileInvoiceDollar, FaHeadset } from 'react-icons/fa6';
import { reportError } from '../../helpers/logging.helper';
import dashboardStyles from '../dashboard/Dashboard.module.css';

type Accent = 'Primary' | 'Success' | 'Info' | 'Danger';

const accentCardClass: Record<Accent, string> = {
    Primary: dashboardStyles.accentPrimary,
    Success: dashboardStyles.accentSuccess,
    Info: dashboardStyles.accentInfo,
    Danger: dashboardStyles.accentDanger,
};

const accentButtonClass: Record<Accent, string> = {
    Primary: dashboardStyles.btnPrimary,
    Success: dashboardStyles.btnSuccess,
    Info: dashboardStyles.btnInfo,
    Danger: dashboardStyles.btnDanger,
};

const quickActions = [
    {
        key: 'inventory',
        title: 'Inventario activo',
        description: 'Administra tu catálogo y mantén precios actualizados.',
        Icon: FaBoxOpen,
        accent: 'Primary' as Accent,
        ctaLabel: 'Gestionar productos',
        to: '/seller/products',
    },
    {
        key: 'orders',
        title: 'Órdenes & boletas',
        description: 'Revisa ventas recientes y el detalle de cada pedido.',
        Icon: FaFileInvoiceDollar,
        accent: 'Success' as Accent,
        ctaLabel: 'Consultar boletas',
        to: '/seller/orders',
    },
    {
        key: 'support',
        title: 'Soporte',
        description: 'Activa alertas cuando necesites ayuda del equipo LevelUp.',
        Icon: FaHeadset,
        accent: 'Danger' as Accent,
        ctaLabel: 'Contactar soporte',
        to: '/contact',
    },
];

export const SellerDashboard = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const fallbackImage = 'https://placehold.co/80x80?text=Producto';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts({ includeInactive: true });
                setProducts(data);
            } catch (error) {
                reportError('SellerDashboard:fetchProducts', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const lowStockCount = useMemo(
        () => products.filter((product) => product.stock <= (product.stockCritical ?? 5)).length,
        [products]
    );

    const categoryCount = useMemo(() => new Set(products.map((product) => product.category)).size, [products]);

    const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
        event.currentTarget.src = fallbackImage;
    };

    return (
        <div className={dashboardStyles.dashboardWrapper}>
            <div className="container">
                <header className={`${dashboardStyles.dashboardHeader} mb-5`}>
                    <div className={dashboardStyles.headerContent}>
                        <p className={dashboardStyles.dashboardEyebrow}>Gestión comercial</p>
                        <h1 className={dashboardStyles.dashboardHeadline}>Panel de Ventas</h1>
                        <p className={dashboardStyles.dashboardDescription}>
                            Hola {user?.name ?? 'vendedor'}, aquí puedes seguir el estado de tu catálogo y detectar
                            oportunidades de venta en tiempo real.
                        </p>
                    </div>
                    <span className={`${dashboardStyles.roleBadge} ${dashboardStyles.roleSeller}`}>
                        Vendedor
                    </span>
                </header>

                <div className="row g-4 mb-4">
                    {quickActions.map(({ key, title, description, Icon, accent, ctaLabel, to }) => {
                        const cardAccent = accentCardClass[accent];
                        const buttonAccent = accentButtonClass[accent];

                        return (
                            <div className="col-md-6 col-lg-3" key={key}>
                                <div className={`${dashboardStyles.infoCard} ${cardAccent}`}>
                                    <div className={dashboardStyles.iconChip} aria-hidden="true">
                                        <Icon />
                                    </div>
                                    <h3 className={dashboardStyles.infoCardTitle}>{title}</h3>
                                    <p className={dashboardStyles.infoCardText}>{description}</p>
                                    <Link
                                        to={to}
                                        className={`${dashboardStyles.actionLink} ${buttonAccent}`}
                                    >
                                        {ctaLabel}
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className={dashboardStyles.tableCard}>
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                        <div>
                            <p className={dashboardStyles.dashboardEyebrow}>Inventario activo</p>
                            <h2 className={dashboardStyles.tableTitle}>Productos en catálogo</h2>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeHealthy}`}>
                                Publicados: {products.length}
                            </span>
                            <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeNeutral}`}>
                                Categorías: {categoryCount}
                            </span>
                            <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeLowStock}`}>
                                Stock crítico: {lowStockCount}
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-light" role="status" aria-label="Cargando inventario" />
                        </div>
                    ) : (
                        <div className={dashboardStyles.tableResponsive}>
                            <table className={`table ${dashboardStyles.table}`}>
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Código</th>
                                        <th>Categoría</th>
                                        <th>Precio</th>
                                        <th>Stock</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => {
                                        const isLowStock = product.stock <= (product.stockCritical ?? 5);
                                        const stockBadge = isLowStock
                                            ? dashboardStyles.badgeLowStock
                                            : dashboardStyles.badgeHealthy;
                                        return (
                                            <tr key={product.code}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <img
                                                            src={product.image || fallbackImage}
                                                            alt={product.name}
                                                            className={dashboardStyles.tableImage}
                                                            loading="lazy"
                                                            onError={handleImageError}
                                                        />
                                                        <div>
                                                            <p className="mb-0 text-white fw-semibold">{product.name}</p>
                                                            <small className={dashboardStyles.helperText}>#{product.id}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{product.code}</td>
                                                <td>
                                                    <span className={`${dashboardStyles.tableBadge} ${dashboardStyles.badgeNeutral}`}>
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td>${product.price.toLocaleString('es-CL')}</td>
                                                <td>
                                                    <span className={`${dashboardStyles.tableBadge} ${stockBadge}`}>
                                                        {product.stock} ud.
                                                    </span>
                                                </td>
                                                <td>
                                                    <Link
                                                        to={`/products/${product.code}`}
                                                        className={dashboardStyles.tableAction}
                                                    >
                                                        Ver detalle
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <p className={`${dashboardStyles.helperText} mt-3`}>
                        Para actualizar stock crítico o desactivar productos, comunícate con el equipo de soporte
                        LevelUp.
                    </p>
                </div>

                <div className={dashboardStyles.alertCard}>
                    La sección de órdenes consolidadas estará disponible pronto. Mientras tanto puedes revisar boletas
                    específicas desde la ruta «/boletas/user/:id» si necesitas validar alguna venta.
                </div>
            </div>
        </div>
    );
};

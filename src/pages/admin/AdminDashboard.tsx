import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { FaUsers, FaBoxOpen, FaNewspaper, FaChartLine, FaTags, FaComments } from 'react-icons/fa6';
import dashboardStyles from '../dashboard/Dashboard.module.css';

type Accent = 'Primary' | 'Success' | 'Warning' | 'Info';

const accentCardClass: Record<Accent, string> = {
    Primary: dashboardStyles.accentPrimary,
    Success: dashboardStyles.accentSuccess,
    Warning: dashboardStyles.accentWarning,
    Info: dashboardStyles.accentInfo,
};

const accentButtonClass: Record<Accent, string> = {
    Primary: dashboardStyles.btnPrimary,
    Success: dashboardStyles.btnSuccess,
    Warning: dashboardStyles.btnWarning,
    Info: dashboardStyles.btnInfo,
};

const adminActions = [
    {
        key: 'users',
        title: 'Usuarios',
        description: 'Administra roles, credenciales y accesos a cada módulo.',
        Icon: FaUsers,
        accent: 'Primary' as Accent,
        ctaLabel: 'Gestionar usuarios',
        to: '/admin/users',
    },
    {
        key: 'catalog',
        title: 'Productos',
        description: 'Gestiona catálogos y actualiza información sobre los productos.',
        Icon: FaBoxOpen,
        accent: 'Success' as Accent,
        ctaLabel: 'Revisar inventario',
        to: '/admin/products',
    },
    {
        key: 'content',
        title: 'Blogs',
        description: 'Publica novedades, guías y comunicados oficiales.',
        Icon: FaNewspaper,
        accent: 'Warning' as Accent,
        ctaLabel: 'Gestionar blogs',
        to: '/admin/blogs',
    },
    {
        key: 'categories',
        title: 'Categorias',
        description: 'Mantén alineados filtros y jerarquías del catálogo.',
        Icon: FaTags,
        accent: 'Info' as Accent,
        ctaLabel: 'Gestionar categorías',
        to: '/admin/categories',
    },
    {
        key: 'reviews',
        title: 'Reseñas',
        description: 'Modera testimonios y resalta experiencias reales.',
        Icon: FaComments,
        accent: 'Warning' as Accent,
        ctaLabel: 'Revisar reseñas',
        to: '/admin/reviews',
    },
    {
        key: 'reports',
        title: 'Boletas',
        description: 'Visualiza los pedidos realizados por los usuarios.',
        Icon: FaChartLine,
        accent: 'Info' as Accent,
        ctaLabel: 'Gestionar boletas',
        to: '/admin/orders',
    },
];

export const AdminDashboard = () => {
    const { user } = useAuth();

    return (
        <div className={dashboardStyles.dashboardWrapper}>
            <div className="container">
                <header className={`${dashboardStyles.dashboardHeader} mb-5`}>
                    <div className={dashboardStyles.headerContent}>
                        <p className={dashboardStyles.dashboardEyebrow}>Administración centralizada</p>
                        <h1 className={dashboardStyles.dashboardHeadline}>Panel de Administración</h1>
                        <p className={dashboardStyles.dashboardDescription}>
                            Hola {user?.name ?? 'LevelUp'}. Desde este panel puedes monitorear a toda la organización
                            y orquestar los recursos críticos del ecommerce.
                        </p>
                    </div>
                    <span className={`${dashboardStyles.roleBadge} ${dashboardStyles.roleAdmin}`}>
                        Administrador
                    </span>
                </header>

                <div className="row g-4">
                    {adminActions.map(({ key, title, description, Icon, accent, ctaLabel, to }) => {
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
            </div>
        </div>
    );
};

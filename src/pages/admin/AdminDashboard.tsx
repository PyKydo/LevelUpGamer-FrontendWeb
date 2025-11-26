import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { FaUsers, FaBoxOpen, FaNewspaper, FaChartLine } from 'react-icons/fa6';
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
        disabled: true,
    },
    {
        key: 'catalog',
        title: 'Inventario Global',
        description: 'Audita catálogos y coordina cargas entre equipos.',
        Icon: FaBoxOpen,
        accent: 'Success' as Accent,
        ctaLabel: 'Revisar inventario',
        to: '/seller',
    },
    {
        key: 'content',
        title: 'Blog & Noticias',
        description: 'Publica novedades, guías y comunicados oficiales.',
        Icon: FaNewspaper,
        accent: 'Warning' as Accent,
        ctaLabel: 'Abrir gestor (pronto)',
        disabled: true,
    },
    {
        key: 'reports',
        title: 'Reportes & Ventas',
        description: 'Visualiza métricas, desempeño y proyecciones.',
        Icon: FaChartLine,
        accent: 'Info' as Accent,
        ctaLabel: 'Ver reportes (pronto)',
        disabled: true,
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
                    {adminActions.map(({ key, title, description, Icon, accent, ctaLabel, to, disabled }) => {
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
                                    {to ? (
                                        <Link
                                            to={to}
                                            className={`${dashboardStyles.actionLink} ${buttonAccent}`}
                                        >
                                            {ctaLabel}
                                        </Link>
                                    ) : (
                                        <button
                                            type="button"
                                            className={`${dashboardStyles.actionButton} ${buttonAccent}`}
                                            disabled={disabled}
                                        >
                                            {ctaLabel}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

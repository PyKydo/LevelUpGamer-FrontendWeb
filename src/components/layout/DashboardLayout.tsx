import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
    role: 'ADMINISTRADOR' | 'VENDEDOR';
}

export const DashboardLayout = ({ role }: DashboardLayoutProps) => {
    return (
        <div className="d-flex">
            <Sidebar role={role} />
            <main className="flex-grow-1 p-4" style={{ height: '100vh', overflowY: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
};

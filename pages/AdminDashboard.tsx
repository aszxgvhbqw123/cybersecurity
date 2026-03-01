import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Logo from '../components/Logo';

const AdminDashboard: React.FC = () => {
    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            isActive
                ? 'bg-accent-blue/10 text-accent-blue'
                : 'text-text-secondary hover:bg-secondary hover:text-text-primary'
        }`;

    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            {/* Sidebar */}
            <aside className="w-64 bg-secondary flex-shrink-0 p-4 border-r border-gray-800 hidden md:flex flex-col">
                <div className="flex items-center gap-2 mb-8 px-2">
                    <Logo className="h-8 w-auto" />
                    <span className="text-xl font-bold text-text-primary">Admin Panel</span>
                </div>
                <nav className="flex-1 space-y-2">
                    <NavLink to="/admin" end className={navLinkClass}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin/courses" className={navLinkClass}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L9 9.61v5.07L2.969 11.48a1 1 0 10-1.938.52l7 3.5a1 1 0 00.938 0l7-3.5a1 1 0 10-1.938-.52L11 14.68V9.61l6.606-2.67a1 1 0 000-1.84l-7-3zM10 8.23L4.053 5.5 10 2.77l5.947 2.73L10 8.23z" /></svg>
                        <span>Manage Courses</span>
                    </NavLink>
                    <NavLink to="/admin/users" className={navLinkClass}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                        <span>Manage Users</span>
                    </NavLink>
                    <NavLink to="/admin/settings" className={navLinkClass}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                        <span>Site Settings</span>
                    </NavLink>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminDashboard;
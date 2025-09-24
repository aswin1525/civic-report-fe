import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HomeIcon, SearchIcon, PlusCircleIcon, UserIcon, LogOutIcon } from '../constants';

const navItems = [
    { path: '/', icon: HomeIcon, label: 'Home' },
    { path: '/search', icon: SearchIcon, label: 'Search' },
    { path: '/create', icon: PlusCircleIcon, label: 'Report' },
    { path: '/profile', icon: UserIcon, label: 'Profile' },
];

const DesktopSidebar: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const navLinkClasses = "flex items-center px-4 py-3 text-dark-200 rounded-lg hover:bg-dark-700 transition-colors";
    const activeNavLinkClasses = "bg-primary text-white";

    return (
        <aside className="hidden md:flex flex-col w-64 bg-dark-800 border-r border-dark-700 fixed h-full">
            <div className="px-6 py-4">
                <h1 className="text-2xl font-bold text-white">Civic Resolve</h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end
                        className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
                    >
                        <item.icon className="w-6 h-6 mr-3" />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-dark-700">
                <div className="flex items-center mb-4">
                    {/* Fix: Corrected property name from 'avatarUrl' to 'avatar_url' to match the User type definition. */}
                    <img src={user?.avatar_url} alt={user?.username} className="w-10 h-10 rounded-full mr-3" />
                    <div>
                        <p className="font-semibold text-white">{user?.username}</p>
                        <p className="text-xs text-dark-400 capitalize">{user?.type}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2 text-dark-200 rounded-lg hover:bg-dark-700 transition-colors"
                >
                    <LogOutIcon className="w-5 h-5 mr-2" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

const MobileBottomNav: React.FC = () => {
    const navLinkClasses = "flex flex-col items-center justify-center w-full h-full text-dark-400";
    const activeNavLinkClasses = "text-primary";

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-700 z-10 h-16">
            <div className="flex justify-around h-full">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end
                        className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
                    >
                        <item.icon className="w-6 h-6 mb-1" />
                        <span className="text-xs">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

const MobileHeader: React.FC = () => {
    const location = useLocation();
    const currentPage = navItems.find(item => item.path === location.pathname)?.label || 'Civic Resolve';

    return (
        <header className="md:hidden fixed top-0 left-0 right-0 bg-dark-800/80 backdrop-blur-sm border-b border-dark-700 z-10 h-16 flex items-center justify-center px-4">
            <h1 className="text-xl font-bold text-white">{currentPage}</h1>
        </header>
    );
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-dark-900">
            <DesktopSidebar />
            <MobileHeader />
            <main className="md:ml-64 pt-20 pb-20 md:pt-8 md:pb-8 px-4 md:px-8">
                {children}
            </main>
            <MobileBottomNav />
        </div>
    );
};

export default Layout;
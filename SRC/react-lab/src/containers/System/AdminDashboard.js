import React, { useState } from 'react';
import UserHeader from '../Header/UserHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './AdminDashboard.scss';

const AdminMenu = {
    Overview: React.lazy(() => import('../Admin/Overview')),
    Users: React.lazy(() => import('../Admin/Users')),
    Products: React.lazy(() => import('../Admin/Products')),
    Transactions: React.lazy(() => import('../Admin/Transactions')),
    Reports: React.lazy(() => import('../Admin/Reports')),
    Settings: React.lazy(() => import('../Admin/Settings'))
};

export default function AdminDashboard() {
    const [selectedMenu, setSelectedMenu] = useState('overview');
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

    const menuItems = [
        { id: 'overview', label: 'Tổng quan', icon: 'chart-line' },
        { id: 'users', label: 'Người dùng', icon: 'users' },
        { id: 'products', label: 'Sản phẩm', icon: 'box' },
        { id: 'transactions', label: 'Giao dịch', icon: 'money-bill-wave' },
        { id: 'reports', label: 'Báo cáo', icon: 'flag' },
        { id: 'settings', label: 'Cài đặt', icon: 'cog' }
    ];

    const handleMenuClick = (menuId) => {
        setSelectedMenu(menuId);
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!isSidebarCollapsed);
    };

    const SelectedComponent = AdminMenu[selectedMenu.charAt(0).toUpperCase() + selectedMenu.slice(1)] || AdminMenu.Overview;

    return (
        <div className="admin-dashboard">
            <UserHeader />
            <div className="dashboard-container">
                <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                    <div className="sidebar-header">
                        <h2>{isSidebarCollapsed ? 'A' : 'Admin'}</h2>
                        <button className="toggle-btn" onClick={toggleSidebar}>
                            <FontAwesomeIcon icon={isSidebarCollapsed ? 'angle-right' : 'angle-left'} />
                        </button>
                    </div>
                    <nav className="sidebar-nav">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                className={`nav-item ${selectedMenu === item.id ? 'active' : ''}`}
                                onClick={() => handleMenuClick(item.id)}
                            >
                                <FontAwesomeIcon icon={item.icon} />
                                {!isSidebarCollapsed && <span>{item.label}</span>}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="dashboard-main">
                    <React.Suspense fallback={<div className="loading">Loading...</div>}>
                        <SelectedComponent />
                    </React.Suspense>
                </main>
            </div>
        </div>
    );
}
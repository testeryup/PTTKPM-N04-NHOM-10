import UserHeader from "../Header/UserHeader";
import './SellerDashboard.scss';
import { useState } from "react";
import Menu from "../Header/Seller";;

export default function SellerDashboard() {
    const [selectedMenu, setSelectedMenu] = useState('monitor');

    const menuItems = [
        { id: 'monitor', label: 'Tổng quan', icon: 'monitoring', component: Menu.SellerMonitor },
        { id: 'products', label: 'Quản lý gian hàng', icon: 'inventory_2', component: Menu.SellerProducts },
        { id: 'orders', label: 'Đơn hàng', icon: 'orders', component: Menu.SellerOrders },
        { id: 'message', label: 'Tin nhắn', icon: 'inbox', component: Menu.SellerMessage },
        { id: 'coupon', label: 'Khuyến mãi', icon: 'loyalty', component: Menu.SellerCoupon },
        { id: 'payment', label: 'Thanh toán', icon: 'payments', component: Menu.SellerPayment }
    ];

    const handleMenuClick = (menuId) => {
        setSelectedMenu(menuId);
    };

    const SelectedComponent = menuItems.find(item => item.id === selectedMenu)?.component || Menu.SellerMonitor;

    return (
        <>
            <UserHeader></UserHeader>
            <div className="dashboard-container">
                <div className="dashboard-wrapper">
                    <div className="dashboard-content">
                        <div className="nav-taskbar">
                            <div className="nav-taskbar-wrapper">
                                {menuItems.map(item => (
                                    <div
                                        key={item.id}
                                        className={`menu-item ${selectedMenu === item.id ? 'active' : ''}`}
                                        onClick={() => handleMenuClick(item.id)}
                                    >
                                        <span className="material-symbols-outlined">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="component">
                            <SelectedComponent />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
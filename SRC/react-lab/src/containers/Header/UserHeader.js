import './UserHeader.scss';
import { useEffect } from 'react';
import { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { path } from "../../ultils";
import { logout } from "../../features/auth/authSlice";
import CartPreview from './User/CartPreview';
import { formatCurrency } from '../../ultils';
export default function UserHeader() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const auth = useSelector(state => state.auth);
    const { profile, loading, error } = useSelector(state => state.user);
    const [showCart, setShowCart] = useState(false);
    const { items } = useSelector(state => state.cart);

    useEffect(() => {

    }, [profile]);

    const handleLogout = async () => {
        await dispatch(logout());
        navigate(path.HOME);
    }
    const handleGoHome = () => {
        navigate(path.HOME);
    }

    const roleComponents = {
        seller: (
            <div>
                <Link to={path.SELLER_DASHBOARD} style={{ display: "flex", justifyContent: 'center', alignItems: 'center' }}>
                    <span className="material-symbols-outlined">store</span>
                    <span>Cửa hàng</span>
                </Link>
            </div>
        ),
        admin: (
            <div>
                <Link to={path.ADMIN_DASHBOARD}>
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                    <span>Admin</span>
                </Link>
            </div>
        ),
        default: (
            <div className='cart-section'
                onMouseEnter={() => setShowCart(true)}
                onMouseLeave={() => setShowCart(false)}>
                <Link to="/cart" className='add-to-cart'>
                    <FontAwesomeIcon icon="fa-solid fa-cart-shopping" />
                    {items?.length > 0 && (
                        <span className="cart-count">{items.length}</span>
                    )}
                </Link>
                {showCart && <CartPreview items={items} />}
            </div>
        )
    };

    return (
        <div className="header-container">
            <div className="header-wrapper">
                <div className="header-content">
                    <div className='content-left'>
                        <div className="logo" onClick={handleGoHome}>OCTOPUS</div>
                        <div className="route-section">
                            <ul className='route-list'>
                            <li className='route'><Link to="/products">
                                    Tất cả sản phẩm
                                </Link></li>
                                {/* <li className='route'>Sản phẩm mua nhiều</li>
                                <li className='route'>Sản phẩm khuyến mại</li> */}
                                <li className='route'><Link to="/topup">
                                    Nạp tiền
                                </Link></li>
                                <li className='route'><Link to="/about">
                                    Về chúng tôi
                                </Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className='content-right'>
                        {
                            profile ?
                                (
                                    <div className="user-section">
                                        {roleComponents[profile.role] || roleComponents.default}

                                        <div className='user-avatar'></div>
                                        <div className='user-info'>
                                            <div className='user-menu'>
                                                <div className="user-trigger">
                                                    <span>{profile.username ? profile.username : 'undefined'}</span>
                                                    <FontAwesomeIcon icon="chevron-down" />
                                                </div>
                                                <div className="dropdown-content">
                                                    <Link to={path.PROFILE}>
                                                        <FontAwesomeIcon icon="user" />
                                                        Trang cá nhân
                                                    </Link>
                                                    {
                                                        profile.role === 'user' &&
                                                        (<Link to="/orders">
                                                            <FontAwesomeIcon icon="shopping-bag" />
                                                            Đơn hàng
                                                        </Link>)
                                                    }
                                                    <Link to="/settings">
                                                        <FontAwesomeIcon icon="cog" />
                                                        Cài đặt
                                                    </Link>
                                                    <Link to="/support">
                                                        <FontAwesomeIcon icon="headset" />
                                                        Trung tâm hỗ trợ
                                                    </Link>
                                                    <Link onClick={handleLogout} className="logout">
                                                        <FontAwesomeIcon icon="sign-out-alt" />
                                                        Đăng xuất
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className='balance-section'><span>{profile.balance >= 0 ? formatCurrency(profile.balance) : 'not defined!'}</span><FontAwesomeIcon icon="fa-solid fa-wallet" /></div>
                                        </div>

                                    </div>
                                )
                                :
                                (<div className='login-route'>
                                    <button className='btn-login' ><Link to={path.LOGIN}>Đăng nhập</Link></button>
                                </div>)
                        }

                    </div>

                </div>
            </div>
        </div>
    )
}
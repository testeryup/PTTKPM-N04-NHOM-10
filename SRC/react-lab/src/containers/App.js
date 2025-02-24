import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { path } from '../ultils';
import { useDispatch, useSelector } from 'react-redux';
import { refreshToken, clearError } from '../features/auth/authSlice';
import { fetchUserProfile } from '../features/user/userSlice';

import { setAuthToken } from '../axios';

import Application from '../components/Application';
import Home from '../components/Home';
import Login from '../features/auth/Login';
import ProtectedRoute from '../components/ProtectedRoute';
import { AdminDashboard, SellerDashboard } from '../containers/System';
import UserDashboard from '../containers/System/UserDashboard';
import UserProfile from './Header/User/UserProfile';
import SignUp from '../features/auth/SignUp';
import Loading from '../components/Loading';
import ProductDetail from './HomePage/ProductDetail';
import CartPage from './Header/User/Checkout/CartPage';
import Checkout from './Header/User/Checkout/Checkout';
import PaymentSuccess from './Header/User/PaymentSuccess';
import MyOrders from './Header/User/MyOrders';
import OrderDetail from './Header/User/OrderDetail';
import Support from './Header/User/Support';
import Topup from './HomePage/Topup';
import About from '../components/About';
import AllProducts from '../components/AllProducts.js'
import { Toaster } from 'react-hot-toast';

import './App.scss';

export default function App() {
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
            if (auth.token) {
                setAuthToken(auth.token);
                await dispatch(fetchUserProfile());
            }
            setIsInitialized(true);
        };
        initializeAuth();
    }, [dispatch, auth.token]);

    if (!isInitialized) return <Loading></Loading>;

    return (
        <>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                        padding: '16px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                    success: {
                        icon: '🎉',
                        style: {
                            background: 'linear-gradient(to right, #00b09b, #96c93d)',
                            color: 'white',
                        },
                        iconTheme: {
                            primary: '#fff',
                            secondary: '#00b09b',
                        }
                    },
                    error: {
                        icon: '❌',
                        style: {
                            background: 'linear-gradient(to right, #ff5f6d, #ffc371)',
                            color: 'white',
                        },
                        iconTheme: {
                            primary: '#fff',
                            secondary: '#ff5f6d',
                        }
                    }
                }}
                gutter={8}
                containerStyle={{
                    top: 20,
                    right: 20,
                }}
                containerClassName="toast-container"
            />
            <Routes>

                <Route path={path.UNAUTHORIZED} element={<h1>Unauthorized Access</h1>} />
                <Route path={path.HOME} element={<Home></Home>} />
                <Route path={path.APP} element={<Application />} />
                <Route path={path.LOGIN} element={<Login />} />
                <Route path={path.SIGNUP} element={auth.isAuthenticated ? <Home></Home> : <SignUp></SignUp>}></Route>
                <Route
                    path={path.PRODUCT}
                    element={<ProductDetail />}
                />
                <Route
                    path={path.USER_DASHBOARD}
                    element={
                        <ProtectedRoute allowedRoles={['user']}>
                            <UserDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={path.PROFILE}
                    element={
                        <ProtectedRoute allowedRoles={['user', 'seller', 'admin']}>
                            <UserProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={path.SELLER_DASHBOARD}
                    element={
                        <ProtectedRoute allowedRoles={['seller']}>
                            <SellerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={path.ADMIN_DASHBOARD}
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path={path.CHECKOUT} element={<Checkout></Checkout>}></Route>
                <Route path={path.CART} element={<CartPage />} />
                <Route path={path.CHECKOUT_SUCCESS} element={<PaymentSuccess></PaymentSuccess>}></Route>
                <Route path={path.VIEWORDER} element={<OrderDetail></OrderDetail>}></Route>
                <Route path={path.ORDERS} element={<MyOrders></MyOrders>}></Route>
                <Route path={path.SUPPORT} element={<Support></Support>}></Route>
                <Route path={path.TOPUP} element={<Topup></Topup>}></Route>
                <Route path="/products" element={<AllProducts />} />
                <Route path="/about" element={<About />} />
                {/* Catch-All Route */}
                <Route path='*' element={<h1>404 - Page Not Found</h1>} />


            </Routes>
        </>
    );
}
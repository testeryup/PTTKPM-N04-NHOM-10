// src/features/auth/Login.js
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { login } from "./authSlice";
import { path } from "../../ultils";
import UserHeader from "../../containers/Header/UserHeader";

import './Login.scss';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null)
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const auth = useSelector(state => state.auth);
    const user = useSelector(state => state.user);

    useEffect(() => {
        if (auth.isAuthenticated && user.role) {
            // Navigate based on role
            switch (user.role) {
                case 'seller':
                    navigate(path.SELLER_DASHBOARD);
                    break;
                case 'admin':
                    navigate(path.ADMIN_DASHBOARD);
                    break;
                default:
                    navigate(path.HOME);
            }
        }
    }, [auth.isAuthenticated, user.role, navigate]);

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        try {
            await dispatch(login({ email, password })).unwrap();
        } catch (error) {
            setError(error || 'Đăng nhập thất bại');
        }
    }

    const handleSignup = () => {
        navigate(path.SIGNUP);
    }
    return (
        <>
            <UserHeader></UserHeader>
            <div className="login-container">

                <div className="login-box">
                    <h2>Welcome back</h2>
                    <div className="detail">Please enter your details</div>
                    <div className="credential">
                        <div className="email-section form-group">
                            <label for="email">Email</label>
                            <input type="email" placeholder="Enter your email"
                                id="email"
                                onChange={(event) => setEmail(event.target.value)}
                                value={email}
                            ></input>
                        </div>
                        <div className="password-section form-group">
                            <label for="password">Password</label>
                            <input type="password" placeholder="Enter your password"
                                id="password"
                                onChange={(event) => setPassword(event.target.value)}
                                value={password}
                            ></input>
                        </div>
                    </div>
                    <div className="error-handler">
                        <span className="error-msg">{error ? error : ''}</span>
                        <span className="forgot-password">Forgot password</span>
                    </div>
                    <button
                        className="btn-confirm"
                        onClick={handleLogin}
                        disabled={auth.loading}
                    >
                        {auth.loading ? 'Logging in...' : 'Login now'}
                    </button>
                    <div className="sign-up-section">
                        <span>Don't have an account? </span>
                        <span className="sign-up" onClick={handleSignup}>Sign up now</span>
                    </div>
                </div>
            </div>
        </>
    );
}
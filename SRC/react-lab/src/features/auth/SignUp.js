import './SignUp.scss'
import UserHeader from '../../containers/Header/UserHeader';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { register } from './authSlice';
import { path } from '../../ultils';

export default function SignUp() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verifyPassword, setVerifyPassword] = useState('');
    const [username, setUserName] = useState('');
    const [error, setError] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const auth = useSelector(state => state.auth);
    useEffect(() => {
        if (auth.isAuthenticated) {
            navigate(path.HOME);
        }
    }, [auth.isAuthenticated, navigate]);
    const handleSignUp = async () => {
        if (!email || !password || !username || !verifyPassword) {
            setError("Email, password, and Username are required");
            return;
        }
        try {
            await dispatch(register({ email, password, username, verifyPassword })).unwrap();
        } catch (err) {
            setError(err);
        }
    }

    const handleLogin = () => {
        navigate(path.LOGIN)
    }
    return (
        <>
            <UserHeader></UserHeader>
            <div className='signup-container'>
                <div className='signup-wrapper'>
                    <div className='signup-content'>
                        <h2>Đăng ký tài khoản</h2>
                        <div className='detail'>Nhập thông tin tài khoản</div>
                        <div className='credential'>
                            <div className='email-section form-group'>
                                <label htmlFor="email">Email</label>
                                <input type="email" placeholder="Nhập email"
                                    id="email"
                                    onChange={(event) => setEmail(event.target.value)}
                                    value={email}></input>
                            </div>
                            <div className='password-section form-group'>
                                <label htmlFor="password">Mật khẩu</label>
                                <input type="password" placeholder="Nhập mật khẩu"
                                    id="password"
                                    onChange={(event) => setPassword(event.target.value)}
                                    value={password}></input>
                            </div>
                            <div className='password-section form-group'>
                                <label htmlFor="password">Xác nhận mật khẩu</label>
                                <input type="password" placeholder="Xác nhận mật khẩu"
                                    id="password"
                                    onChange={(event) => setVerifyPassword(event.target.value)}
                                    value={verifyPassword}></input>
                            </div>
                            <div className='username-section form-group'>
                                <label htmlFor="username">Username</label>
                                <input type="text" placeholder="Nhập username"
                                    id="username"
                                    onChange={(event) => setUserName(event.target.value)}
                                    value={username}></input>
                            </div>
                        </div>
                        {error &&
                            <div className="error-handler">
                                <span className="error-msg">{error}</span>
                                {/* <span className="forgot-password">Forgot password</span> */}
                            </div>
                        }
                        <button
                            className="btn-confirm"
                            onClick={handleSignUp}
                            disabled={auth.loading}
                            
                        >
                            {auth.loading ? 'Đang đăng ký tài khoản...' : 'Đăng ký tài khoản'}
                        </button>
                        <div className="sign-in-section">
                            <span>Đã có tài khoản? Vậy thì{' '}</span>
                            <span className="sign-in" onClick={handleLogin}>Đăng nhập luôn</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
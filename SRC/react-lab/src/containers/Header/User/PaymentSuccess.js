import { path } from "../../../ultils";
import "./PaymentSuccess.scss"
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import UserHeader from "../UserHeader";

const PaymentSuccess = () => {
    const [url, setUrl] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if both location.state and location.state.detail exist
        if (!location.state || !location.state.detail) {
            navigate(path.HOME);
            return;
        }
        setUrl(`/orders/${location.state.detail.orderId}`);
    }, [location, navigate]);

    const handleViewOrder = () => {
        navigate(url);
    }

    if (!location.state || !location.state.detail) {
        return null;
    }
    return (
        <>
            <UserHeader></UserHeader>
            <div className="payment-success">
                <div className="payment-success__card">
                    <div className="payment-success__icon">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                    </div>
                    <h1 className="payment-success__title">Thanh toán thành công</h1>
                    <p className="payment-success__message">
                        Đơn hàng của bạn đã được xử lý thành công, cảm ơn bạn đã ủng hộ chúng tôi
                    </p>
                    <div className="payment-success__actions">
                        <button className="payment-success__button payment-success__button--primary">
                            <Link to={path.HOME}>Về trang chủ</Link>
                        </button>
                        <button className="payment-success__button payment-success__button--secondary"
                            onClick={handleViewOrder}
                        >Xem thông tin đơn hàng</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PaymentSuccess


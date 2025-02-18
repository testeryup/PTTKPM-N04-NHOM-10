import React, { useState, useEffect } from "react";
import { usePayOS } from "@payos/payos-checkout";
import { toast } from 'react-hot-toast';
import "./Topup.scss";
import { getUserBalance, createPaymentLink } from "../../services/userService";
import UserHeader from "../Header/UserHeader";

const ProductDisplay = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isCreatingLink, setIsCreatingLink] = useState(false);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [amount, setAmount] = useState(0);
    const [error, setError] = useState("");
    const [payOSConfig, setPayOSConfig] = useState({
        RETURN_URL: window.location.origin,
        ELEMENT_ID: "embedded-payment-container",
        CHECKOUT_URL: null,
        embedded: true,
        onSuccess: (event) => {
            setIsOpen(false);
            setMessage("Nạp tiền thành công!");
            // You might want to refresh the balance here
        },
    });

    const { open, exit } = usePayOS(payOSConfig);

    const handleGetPaymentLink = async () => {
        if (!validateAmount(amount)) {
            return;
        }
        try {
            setIsCreatingLink(true);
            exit();
            // const response = await fetch(
            //     `${process.env.REACT_APP_BACKEND_URL}/create-embedded-payment-link`,
            //     {
            //         method: "POST",
            //         credentials: 'include'
            //     }
            // );

            // if (!response.ok) {
            //     throw new Error('Không thể tạo liên kết thanh toán');
            // }

            const result = await createPaymentLink(amount);
            setPayOSConfig((oldConfig) => ({
                ...oldConfig,
                CHECKOUT_URL: result.checkoutUrl,
            }));

            setIsOpen(true);
        } catch (error) {
            toast.error('Không thể tạo liên kết thanh toán');
            console.log("error:", error.message);
        } finally {
            setIsCreatingLink(false);
        }
    };

    const validateAmount = (value) => {
        const numValue = Number(value);
        if (isNaN(numValue)) {
            setError("Vui lòng nhập số tiền hợp lệ");
            return false;
        }
        if (numValue < 10000) {
            setError("Số tiền nạp tối thiểu là 10.000₫");
            return false;
        }
        if (numValue > 50000000) {
            setError("Số tiền nạp tối đa là 50.000.000₫");
            return false;
        }
        setError("");
        return true;
    };
    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setAmount(value);
        validateAmount(value);
    };
    useEffect(() => {
        if (payOSConfig.CHECKOUT_URL != null) {
            open();
        }
    }, [payOSConfig]);

    // You might want to fetch current balance when component mounts
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const response = await getUserBalance();
                if (response.ok === 1) {
                    setCurrentBalance(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch balance:', error);
            }
        };

        fetchBalance();
    }, []);

    return message ? (
        <Message message={message} />
    ) : (
        <div className="topup-container">
            <div className="topup-card">
                <div className="card-header">
                    <h2>Nạp tiền vào tài khoản</h2>
                    <p className="subtitle">Thanh toán an toàn qua PayOS</p>
                </div>

                <div className="payment-section">
                    <div className="balance-info">
                        <div className="info-item">
                            <span className="label">Số dư hiện tại</span>
                            <span className="value">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentBalance)}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Số tiền nạp tối thiểu</span>
                            <span className="value">10.000₫</span>
                        </div>
                    </div>
                    <div className="amount-input-section">
                        <label htmlFor="amount">Số tiền muốn nạp</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                id="amount"
                                value={amount}
                                onChange={handleAmountChange}
                                placeholder="Nhập số tiền"
                                className={error ? 'error' : ''}
                            />
                            <span className="currency">VND</span>
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <div className="quick-amounts">
                            {[50000, 100000, 200000, 500000].map((value) => (
                                <button
                                    key={value}
                                    className="quick-amount-btn"
                                    onClick={() => {
                                        setAmount(value);
                                        validateAmount(value);
                                    }}
                                >
                                    {new Intl.NumberFormat('vi-VN').format(value)}₫
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="payment-actions">
                        {!isOpen ? (
                            <div className="action-container">
                                {isCreatingLink ? (
                                    <div className="creating-link">
                                        <div className="loader"></div>
                                        <span>Đang tạo liên kết thanh toán...</span>
                                    </div>
                                ) : (
                                    <button
                                        className="payment-button"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            handleGetPaymentLink();
                                        }}
                                    >
                                        <i className="fas fa-wallet"></i>
                                        Nạp tiền ngay
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="payment-process">
                                <button
                                    className="close-button"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        setIsOpen(false);
                                        exit();
                                    }}
                                >
                                    <i className="fas fa-times"></i>
                                    Đóng cửa sổ thanh toán
                                </button>

                                <div className="payment-notice">
                                    <i className="fas fa-info-circle"></i>
                                    <p>Sau khi thanh toán thành công, vui lòng đợi 5-10 giây để hệ thống cập nhật số dư.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div
                    id="embedded-payment-container"
                    className="payment-container"
                ></div>
            </div>
        </div>
    );
};

const Message = ({ message }) => (
    <div className="topup-container">
        <div className="message-card">
            <div className="message-content">
                <i className="fas fa-check-circle"></i>
                <h3>{message}</h3>
                <p>Giao dịch của bạn đã được xử lý thành công</p>
            </div>
            <form action="/">
                <button type="submit" className="return-button">
                    <i className="fas fa-arrow-left"></i>
                    Quay lại trang chủ
                </button>
            </form>
        </div>
    </div>
);

export default function Topup() {
    return <>
        <UserHeader></UserHeader>
        <ProductDisplay />
    </>;
}
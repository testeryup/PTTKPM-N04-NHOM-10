import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import UserHeader from '../../UserHeader';
import './Checkout.scss';
import { formatCurrency, path } from '../../../../ultils';
import toast from 'react-hot-toast';
import { removeFromCart } from '../../../../features/cart/cartSlice';
import { initOrder, createOrder } from '../../../../services/userService';

export default function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { profile } = useSelector(state => state.user);



    useEffect(() => {
        // Check for items in location state
        if (!location?.state?.items) {
            toast.error('Không tìm thấy thông tin đơn hàng');
            navigate(path.CART);
            return;
        }

        // Validate items
        const validateItems = async () => {
            try {
                const result = await initOrder(location.state.items);
                if (result.errCode !== 0) {
                    toast.error('Mặt hàng bạn đang yêu cầu không tồn tại hoặc đã hết');
                    // navigate(path.CART);
                }
            } catch (error) {
                console.error('Validation error:', error);
                toast.error('Có lỗi xảy ra khi kiểm tra đơn hàng');
                navigate(path.CART);
            } finally {
                setIsLoading(false);
            }
        };

        validateItems();
        console.log("check var location state:", location?.state?.items || undefined);
    }, [location, navigate]);

    // If no items in state, return early
    if (!location?.state?.items) {
        return null;
    }
    const items = location.state.items;
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handlePlaceOrder = async () => {
        try {
            if (profile.balance < total) {
                toast.error('Số dư không đủ');
                return;
            }

            const result = await createOrder(items);
            if(result.errCode !== 0){
                throw new Error(result);
            }

            toast.success('Đặt hàng thành công');
            console.log("order result:", result);
            for(const item of items){
                dispatch(removeFromCart(item.skuId));
            }
            navigate(path.CHECKOUT_SUCCESS, {state: {
                detail: result.data
            }});
        } catch (error) {
            toast.error('Đặt hàng thất bại');
            console.error('Order placement failed:', error);
        }
        
    };

    return (
        <>
            <UserHeader />
            <div className="checkout-container">
                <div className="checkout-content">
                    <div className="order-summary">
                        <h2>Xác nhận đơn hàng</h2>
                        <div className="items-list">
                            {items.map(item => (
                                <div key={item.skuId} className="checkout-item">
                                    <img src={item.image} alt={item.name} />
                                    <div className="item-details">
                                        <h3>{item.name}</h3>
                                        <p className="sku-name">{item.skuName}</p>
                                        <p className="quantity">Số lượng: {item.quantity}</p>
                                        <p className="price">{formatCurrency(item.price)}₫</p>
                                    </div>
                                    <div className="item-total">
                                        {formatCurrency(item.price * item.quantity)}₫
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="payment-info">
                            <div className="balance-info">
                                <span>Số dư hiện tại:</span>
                                <span>{formatCurrency(profile?.balance || 0)}₫</span>
                            </div>
                            <div className="total-info">
                                <span>Tổng thanh toán:</span>
                                <span className="final-total">{formatCurrency(total)}₫</span>
                            </div>
                        </div>

                        <button
                            className="place-order-btn"
                            onClick={handlePlaceOrder}
                            disabled={profile?.balance < total}
                        >
                            Xác nhận đặt hàng
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
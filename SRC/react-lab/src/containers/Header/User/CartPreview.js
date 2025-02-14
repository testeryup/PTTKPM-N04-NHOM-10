import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './CartPreview.scss';

const CartPreview = ({ items = [] }) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="cart-preview">
            <div className="cart-items">
                {items.length === 0 ? (
                    <div className="empty-cart">Giỏ hàng trống</div>
                ) : (
                    <>
                        {items.map(item => (
                            <div key={item.skuId} className="cart-item">
                                <img src={item.image} alt={item.name} />
                                <div className="item-details">
                                    <div className="item-name">{item.name}</div>
                                    <div className="item-price">{item.price.toLocaleString()}đ</div>
                                </div>
                            </div>
                        ))}
                        <div className="cart-total">
                            <span>Tổng cộng:</span>
                            <span>{total.toLocaleString()}đ</span>
                        </div>
                    </>
                )}
            </div>
            <Link to="/cart" className="view-cart-btn">
                Xem giỏ hàng
            </Link>
        </div>
    );
};

export default CartPreview;
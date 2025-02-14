import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '../../../../features/cart/cartSlice';
import { formatCurrency } from '../../../../ultils';
import UserHeader from '../../UserHeader';
import './CartPage.scss';
import { path } from '../../../../ultils';

export default function CartPage() {
    const { items, total } = useSelector(state => state.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedItems, setSelectedItems] = useState(new Set());

    const handleQuantityChange = (skuId, newQuantity) => {
        dispatch(updateQuantity({ skuId, quantity: parseInt(newQuantity) }));
    };

    const handleRemoveItem = (skuId) => {
        dispatch(removeFromCart(skuId));
    };

    const handleItemSelect = (skuId) => {
        setSelectedItems(prev => {
            const newSelected = new Set(prev);
            if (newSelected.has(skuId)) {
                newSelected.delete(skuId);
            } else {
                newSelected.add(skuId);
            }
            return newSelected;
        });
    };

    // Handle select all
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedItems(new Set(items.map(item => item.skuId)));
        } else {
            setSelectedItems(new Set());
        }
    };

    const handleSubmitItemsToCheckout = () => {
        if(selectedItems.size > 0){
            const checkOutItems = items.filter(item => selectedItems.has(item.skuId));
            navigate(path.CHECKOUT, {state: {items: checkOutItems}});
        }
    }
    // Calculate selected items total
    const selectedTotal = items
        .filter(item => selectedItems.has(item.skuId))
        .reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <>
            <UserHeader />
            <div className="cart-container">
                <div className="cart-wrapper">
                    <h1>Giỏ hàng</h1>
                    {items.length === 0 ? (
                        <div className="empty-cart">
                            <p>Giỏ hàng trống</p>
                        </div>
                    ) : (
                        <div className="cart-content">
                            <div className="cart-items">
                                <div className="select-all">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.size === items.length}
                                        onChange={handleSelectAll}
                                    />
                                    <span>Chọn tất cả</span>
                                </div>
                                {items.map(item => (
                                    <div key={item.skuId} className="cart-item">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.has(item.skuId)}
                                            onChange={() => handleItemSelect(item.skuId)}
                                        />
                                        <img src={item.image} alt={item.name} />
                                        <div className="item-details">
                                            <h3>{item.name}</h3>
                                            <p>{item.skuName}</p>
                                            <p className="price">{formatCurrency(item.price)}₫</p>
                                        </div>
                                        <div className="quantity-controls">
                                            <select
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.skuId, e.target.value)}
                                            >
                                                {[...Array(10)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>
                                                        {i + 1}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            className="remove-item"
                                            onClick={() => handleRemoveItem(item.skuId)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="cart-summary">
                                <h2>Tổng cộng ({selectedItems.size} sản phẩm)</h2>
                                <p className="total">{formatCurrency(selectedTotal)}₫</p>
                                <button
                                    className="checkout-button"
                                    disabled={selectedItems.size === 0}
                                    onClick={handleSubmitItemsToCheckout}
                                >
                                    Thanh toán ({selectedItems.size})
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
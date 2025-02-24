import React, { useState } from 'react';
import './RefundModal.scss';

export default function RefundModal({ onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        orderId: '',
        amount: '',
        reason: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>Tạo hoàn tiền mới</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Mã đơn hàng</label>
                        <input
                            type="text"
                            value={formData.orderId}
                            onChange={(e) => setFormData({...formData, orderId: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Số tiền hoàn</label>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Lý do hoàn tiền</label>
                        <textarea
                            value={formData.reason}
                            onChange={(e) => setFormData({...formData, reason: e.target.value})}
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="submit">Xác nhận</button>
                        <button type="button" onClick={onClose}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
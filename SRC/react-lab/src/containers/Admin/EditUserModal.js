import React, { useState } from 'react';
import './EditUserModal.scss';

export default function EditUserModal({ user, onClose, onSave }) {
    const [userData, setUserData] = useState({
        username: user.username,
        email: user.email,
        balance: user.balance
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(userData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Chỉnh sửa người dùng</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={userData.username}
                            onChange={(e) => setUserData({...userData, username: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={userData.email}
                            onChange={(e) => setUserData({...userData, email: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Số dư</label>
                        <input
                            type="number"
                            value={userData.balance}
                            onChange={(e) => setUserData({...userData, balance: Number(e.target.value)})}
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>Hủy</button>
                        <button type="submit">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
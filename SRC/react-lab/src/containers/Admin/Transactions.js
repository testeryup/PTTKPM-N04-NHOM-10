import React, { useState, useEffect } from 'react';
import { getTransactionStats, approveWithdraw, rejectWithdraw } from '../../services/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatCurrency } from '../../ultils';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import './Transactions.scss';

export default function Transactions() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await getTransactionStats();
            if (response.errCode === 0) {
                setStats(response.data);
            } else {
                toast.error('Không thể tải thống kê giao dịch');
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Đã xảy ra lỗi khi tải thống kê');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleApprove = async (transactionId) => {
        try {
            const response = await approveWithdraw(transactionId);
            if (response.errCode === 0) {
                toast.success('Đã duyệt yêu cầu rút tiền');
                fetchStats();
            } else {
                toast.error(response.message || 'Không thể duyệt yêu cầu');
            }
        } catch (error) {
            toast.error('Đã xảy ra lỗi khi duyệt yêu cầu');
        }
    };

    const handleReject = async () => {
        try {
            const response = await rejectWithdraw(selectedTransaction._id, rejectReason);
            if (response.errCode === 0) {
                toast.success('Đã từ chối yêu cầu rút tiền');
                setIsRejectModalOpen(false);
                setRejectReason('');
                fetchStats();
            } else {
                toast.error(response.message || 'Không thể từ chối yêu cầu');
            }
        } catch (error) {
            toast.error('Đã xảy ra lỗi khi từ chối yêu cầu');
        }
    };

    if (loading || !stats) return <Loading />;

    return (
        <div className="admin-transactions">
            <div className="transactions-header">
                <h1>Quản lý giao dịch</h1>
                <button className="refresh-btn" onClick={fetchStats}>
                    <FontAwesomeIcon icon="sync" /> Làm mới
                </button>
            </div>

            <div className="stats-cards">
                <div className="stat-card">
                    <h3>Nạp tiền</h3>
                    <p>{formatCurrency(stats.summary.deposit.total)}₫</p>
                    <div className="stat-details">
                        <span>Số lượng: {stats.summary.deposit.count}</span>
                        <span>Hoàn thành: {stats.summary.deposit.completed}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <h3>Rút tiền</h3>
                    <p>{formatCurrency(stats.summary.withdrawal.total)}₫</p>
                    <div className="stat-details">
                        <span>Đang chờ: {stats.summary.withdrawal.pending}</span>
                        <span>Hoàn thành: {stats.summary.withdrawal.completed}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <h3>Hoàn tiền</h3>
                    <p>{formatCurrency(stats.summary.refund.total)}₫</p>
                    <div className="stat-details">
                        <span>Số lượng: {stats.summary.refund.count}</span>
                        <span>Hoàn thành: {stats.summary.refund.completed}</span>
                    </div>
                </div>
            </div>

            <div className="chart-section">
                <div className="chart-card">
                    <h3>Biểu đồ giao dịch</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={stats.chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis 
                                tickFormatter={(value) => {
                                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                                    return value;
                                }}
                            />
                            <Tooltip 
                                formatter={(value) => [`${formatCurrency(value)}₫`]} 
                                labelFormatter={(label) => `Ngày: ${label}`}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="deposit"
                                name="Nạp tiền"
                                stroke="#2ecc71"
                                activeDot={{ r: 8 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="withdrawal"
                                name="Rút tiền"
                                stroke="#e74c3c"
                                activeDot={{ r: 8 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="refund"
                                name="Hoàn tiền"
                                stroke="#f1c40f"
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="withdrawals-section">
                <h2>Yêu cầu rút tiền đang chờ</h2>
                <div className="withdrawals-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Mã yêu cầu</th>
                                <th>Người yêu cầu</th>
                                <th>Số tiền</th>
                                <th>Thời gian</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentWithdraws.map(withdraw => (
                                <tr key={withdraw._id}>
                                    <td>{withdraw._id}</td>
                                    <td>
                                        <div className="user-info">
                                            <span className="username">{withdraw.userInfo.username}</span>
                                            <span className="email">{withdraw.userInfo.email}</span>
                                        </div>
                                    </td>
                                    <td>{formatCurrency(withdraw.amount)}₫</td>
                                    <td>{new Date(withdraw.createdAt).toLocaleString('vi-VN')}</td>
                                    <td>
                                        <button
                                            className="action-btn approve"
                                            onClick={() => handleApprove(withdraw._id)}
                                            title="Duyệt yêu cầu"
                                        >
                                            <FontAwesomeIcon icon="check" />
                                        </button>
                                        <button
                                            className="action-btn reject"
                                            onClick={() => {
                                                setSelectedTransaction(withdraw);
                                                setIsRejectModalOpen(true);
                                            }}
                                            title="Từ chối yêu cầu"
                                        >
                                            <FontAwesomeIcon icon="times" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isRejectModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Từ chối yêu cầu rút tiền</h3>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Nhập lý do từ chối..."
                            required
                        />
                        <div className="modal-actions">
                            <button 
                                className="confirm-btn"
                                onClick={handleReject}
                                disabled={!rejectReason.trim()}
                            >
                                Xác nhận
                            </button>
                            <button 
                                className="cancel-btn"
                                onClick={() => {
                                    setIsRejectModalOpen(false);
                                    setRejectReason('');
                                }}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { getWithdrawalRequests, createWithdrawalRequest } from '../../../services/sellerService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatCurrency } from '../../../ultils';
import Loading from '../../../components/Loading';
import toast from 'react-hot-toast';
import './SellerPayment.scss';

export default function SellerPayment() {
    const [withdrawals, setWithdrawals] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        status: 'all',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            const response = await getWithdrawalRequests(filters);
            if (response.errCode === 0) {
                setWithdrawals(response.data);
            } else {
                toast.error('Không thể tải danh sách yêu cầu rút tiền');
            }
        } catch (error) {
            console.error('Error fetching withdrawals:', error);
            toast.error('Đã xảy ra lỗi khi tải danh sách');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, [filters]);

    const handleCreateWithdrawal = async (e) => {
        e.preventDefault();
        try {
            const amount = parseInt(withdrawAmount);
            if (!amount || amount <= 0) {
                toast.error('Vui lòng nhập số tiền hợp lệ');
                return;
            }

            const response = await createWithdrawalRequest(amount);
            if (response.errCode === 0) {
                toast.success('Đã tạo yêu cầu rút tiền');
                setIsWithdrawModalOpen(false);
                setWithdrawAmount('');
                fetchWithdrawals();
            } else {
                toast.error(response.message || 'Không thể tạo yêu cầu rút tiền');
            }
        } catch (error) {
            toast.error('Đã xảy ra lỗi khi tạo yêu cầu');
        }
    };

    if (loading || !withdrawals) return <Loading />;

    return (
        <div className="seller-payment">
            <div className="payment-header">
                <h1>Quản lý rút tiền</h1>
                <button 
                    className="withdraw-btn"
                    onClick={() => setIsWithdrawModalOpen(true)}
                >
                    <FontAwesomeIcon icon="money-bill-wave" /> Tạo yêu cầu rút tiền
                </button>
            </div>

            <div className="stats-cards">
    <div className="stat-card">
        <h3>Tổng yêu cầu</h3>
        <p>{withdrawals.filters.status.available.all.count}</p>
        <span>{formatCurrency(withdrawals.filters.status.available.all.amount)}₫</span>
    </div>
    <div className="stat-card">
        <h3>Đang chờ xử lý</h3>
        <p>{withdrawals.filters.status.available.pending?.count || 0}</p>
        <span>{formatCurrency(withdrawals.filters.status.available.pending?.amount || 0)}₫</span>
    </div>
    <div className="stat-card">
        <h3>Đã hoàn thành</h3>
        <p>{withdrawals.filters.status.available.completed?.count || 0}</p>
        <span>{formatCurrency(withdrawals.filters.status.available.completed?.amount || 0)}₫</span>
    </div>
    <div className="stat-card">
        <h3>Đã từ chối</h3>
        <p>{withdrawals.filters.status.available.failed?.count || 0}</p>
        <span>{formatCurrency(withdrawals.filters.status.available.failed?.amount || 0)}₫</span>
    </div>
</div>

            <div className="filters-section">
                <div className="filter-group">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="completed">Đã hoàn thành</option>
                        <option value="rejected">Đã từ chối</option>
                    </select>

                    <select
                        value={filters.limit}
                        onChange={(e) => setFilters({...filters, limit: Number(e.target.value), page: 1})}
                    >
                        <option value={10}>10 / trang</option>
                        <option value={20}>20 / trang</option>
                        <option value={50}>50 / trang</option>
                    </select>
                </div>
            </div>

            <div className="withdrawals-table">
                <table>
                    <thead>
                        <tr>
                            <th>Mã yêu cầu</th>
                            <th>Số tiền</th>
                            <th>Trạng thái</th>
                            <th>Thời gian</th>
                            <th>Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        {withdrawals.requests.map(request => (
                            <tr key={request._id}>
                                <td>{request._id}</td>
                                <td>{formatCurrency(request.amount)}₫</td>
                                <td>
                                    <span className={`status-badge ${request.status}`}>
                                        {request.status === 'pending' ? 'Chờ xử lý' :
                                         request.status === 'completed' ? 'Đã hoàn thành' : 'Đã từ chối'}
                                    </span>
                                </td>
                                <td>{new Date(request.createdAt).toLocaleDateString('vi-VN')}</td>
                                <td>{request.note || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button
                    className="page-btn"
                    disabled={!withdrawals.pagination.hasPrev}
                    onClick={() => setFilters({...filters, page: filters.page - 1})}
                >
                    <FontAwesomeIcon icon="chevron-left" />
                </button>
                
                <span className="page-info">
                    Trang {withdrawals.pagination.currentPage} / {withdrawals.pagination.totalPages}
                </span>

                <button
                    className="page-btn"
                    disabled={!withdrawals.pagination.hasNext}
                    onClick={() => setFilters({...filters, page: filters.page + 1})}
                >
                    <FontAwesomeIcon icon="chevron-right" />
                </button>
            </div>

            {isWithdrawModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Tạo yêu cầu rút tiền</h3>
                        <form onSubmit={handleCreateWithdrawal}>
                            <div className="form-group">
                                <label>Số tiền muốn rút</label>
                                <input
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    placeholder="Nhập số tiền..."
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="submit">Xác nhận</button>
                                <button type="button" onClick={() => setIsWithdrawModalOpen(false)}>
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
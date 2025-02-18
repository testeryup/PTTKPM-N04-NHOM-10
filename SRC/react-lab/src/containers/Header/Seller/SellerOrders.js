import React, { useState, useEffect } from 'react';
import { getOrders, refundOrder, reportOrder, getOrderDetail } from '../../../services/sellerService';
import Loading from '../../../components/Loading';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../../ultils';
import './SellerOrders.scss';

export default function SellerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [orderDetail, setOrderDetail] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNext: false,
        hasPrev: false
    });
    const [activeFilter, setActiveFilter] = useState('all');

    const filterOptions = [
        { value: 'all', label: 'Tất cả', icon: 'fas fa-list-ul' },
        { value: 'completed', label: 'Hoàn thành', icon: 'fas fa-check-circle' },
        { value: 'processing', label: 'Đang xử lý', icon: 'fas fa-clock' },
        { value: 'refunded', label: 'Đã hoàn tiền', icon: 'fas fa-undo' },
        { value: 'reported', label: 'Đã báo cáo', icon: 'fas fa-flag' }
    ];

    const orderStatus = {
        completed: { label: 'Hoàn thành', color: 'success', icon: 'fas fa-check-circle' },
        refunded: { label: 'Đã hoàn tiền', color: 'info', icon: 'fas fa-undo' },
        processing: { label: 'Đang xử lý', color: 'warning', icon: 'fas fa-clock' },
        reported: { label: 'Đã báo cáo', color: 'danger', icon: 'fas fa-flag' },
        default: { label: 'Không xác định', color: 'default', icon: 'fas fa-question-circle' }
    };

    useEffect(() => {
        fetchOrders(pagination.currentPage, activeFilter);
    }, [pagination.currentPage, activeFilter]);

    const fetchOrders = async (page, status = activeFilter) => {
        try {
            setLoading(true);
            const response = await getOrders({
                page,
                limit: pagination.itemsPerPage,
                status: status !== 'all' ? status : undefined
            });

            if (response.errCode === 0) {
                setOrders(response.data.orders);
                setPagination(response.data.pagination);
            } else {
                toast.error('Không thể tải danh sách đơn hàng');
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Đã có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchOrders(pagination.currentPage, activeFilter);
        toast.success('Đã cập nhật danh sách đơn hàng');
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handleFilterChange = (filterValue) => {
        setActiveFilter(filterValue);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleViewDetail = async (orderId) => {
        try {
            setLoading(true);
            const result = await getOrderDetail(orderId);
            if (result.errCode === 0) {
                setOrderDetail(result.data);
                setIsDetailModalOpen(true);
            } else {
                toast.error('Không thể tải chi tiết đơn hàng');
            }
        } catch (error) {
            toast.error('Đã có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleRefund = async (orderId) => {
        try {
            const result = await refundOrder(orderId);
            if (result.errCode === 0) {
                toast.success('Hoàn tiền thành công');
                fetchOrders(pagination.currentPage, activeFilter);
            } else {
                toast.error('Hoàn tiền thất bại');
            }
        } catch (error) {
            toast.error('Đã có lỗi xảy ra');
        }
        setIsRefundModalOpen(false);
    };

    const handleReport = async (orderId) => {
        try {
            const result = await reportOrder(orderId, reportReason);
            if (result.errCode === 0) {
                toast.success('Báo cáo thành công');
                fetchOrders(pagination.currentPage, activeFilter);
            } else {
                toast.error('Báo cáo thất bại');
            }
        } catch (error) {
            toast.error('Đã có lỗi xảy ra');
        }
        setIsReportModalOpen(false);
        setReportReason('');
    };

    const RefundModal = () => (
        <div className={`modal ${isRefundModalOpen ? 'show' : ''}`}>
            <div className="modal-content">
                <h3>Xác nhận hoàn tiền</h3>
                <p>Bạn có chắc chắn muốn hoàn tiền cho đơn hàng #{selectedOrder?.orderId}?</p>
                <div className="modal-actions">
                    <button className="confirm-btn" onClick={() => handleRefund(selectedOrder?.orderId)}>
                        Xác nhận
                    </button>
                    <button className="cancel-btn" onClick={() => setIsRefundModalOpen(false)}>
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );

    const ReportModal = () => (
        <div className={`modal ${isReportModalOpen ? 'show' : ''}`}>
            <div className="modal-content">
                <h3>Báo cáo đơn hàng</h3>
                <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Nhập lý do báo cáo..."
                    rows={4}
                />
                <div className="modal-actions">
                    <button
                        className="confirm-btn"
                        onClick={() => handleReport(selectedOrder?.orderId)}
                        disabled={!reportReason.trim()}
                    >
                        Gửi báo cáo
                    </button>
                    <button className="cancel-btn" onClick={() => setIsReportModalOpen(false)}>
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );

    const OrderDetailModal = () => (
        <div className={`modal ${isDetailModalOpen ? 'show' : ''}`}>
            <div className="modal-content detail-modal">
                <div className="modal-header">
                    <div className="header-content">
                        <h3>Chi tiết đơn hàng #{orderDetail?.orderId}</h3>
                        <span className={`status-badge ${orderStatus[orderDetail?.status]?.color}`}>
                            <i className={orderStatus[orderDetail?.status]?.icon}></i>
                            {orderStatus[orderDetail?.status]?.label}
                        </span>
                    </div>
                    <button className="close-btn" onClick={() => setIsDetailModalOpen(false)}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                {orderDetail && (
                    <div className="detail-content">
                        <div className="info-grid">
                            <div className="detail-section customer-info">
                                <h4><i className="fas fa-user"></i> Thông tin khách hàng</h4>
                                <div className="info-item">
                                    <span className="label">Email:</span>
                                    <span className="value">{orderDetail.buyer.email}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Username:</span>
                                    <span className="value">{orderDetail.buyer.username}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Ngày đặt:</span>
                                    <span className="value">{new Date(orderDetail.createdAt).toLocaleString('vi-VN')}</span>
                                </div>
                            </div>

                            <div className="detail-section order-info">
                                <h4><i className="fas fa-info-circle"></i> Thông tin đơn hàng</h4>
                                <div className="info-item">
                                    <span className="label">Tổng tiền:</span>
                                    <span className="value highlight">{formatCurrency(orderDetail.total)}₫</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Trạng thái thanh toán:</span>
                                    <span className={`value payment-status ${orderDetail.paymentStatus}`}>
                                        {orderDetail.paymentStatus === 'completed' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="detail-section products-section">
                            <h4><i className="fas fa-shopping-cart"></i> Sản phẩm đã mua</h4>
                            <div className="products-list">
                                {orderDetail.items.map((item, index) => (
                                    <div key={index} className="product-card">
                                        <div className="product-info">
                                            <h5>{item.skuDetails.productName}</h5>
                                            <span className="sku-name">{item.skuDetails.name}</span>
                                            <span className="price">{formatCurrency(item.skuDetails.price)}₫</span>
                                        </div>

                                        <div className="accounts-section">
                                            <h6>Tài khoản:</h6>
                                            {item.soldAccounts.map((account, idx) => {
                                                const [username, password] = account.credentials.split('|');
                                                return (
                                                    <div key={idx} className="account-item">
                                                        <div className="credential">
                                                            <span className="label">Username:</span>
                                                            <span className="value">{username}</span>
                                                        </div>
                                                        <div className="credential">
                                                            <span className="label">Password:</span>
                                                            <span className="value">{password}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const Pagination = () => (
        <div className="pagination">
            <button
                className="pagination-btn"
                onClick={() => handlePageChange(1)}
                disabled={!pagination.hasPrev}
            >
                <i className="fas fa-angle-double-left" />
            </button>
            <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
            >
                <i className="fas fa-angle-left" />
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(num => (
                <button
                    key={num}
                    className={`pagination-btn ${pagination.currentPage === num ? 'active' : ''}`}
                    onClick={() => handlePageChange(num)}
                >
                    {num}
                </button>
            ))}
            <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
            >
                <i className="fas fa-angle-right" />
            </button>
            <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={!pagination.hasNext}
            >
                <i className="fas fa-angle-double-right" />
            </button>
        </div>
    );

    if (loading) {
        return <div className="loading-container"><Loading /></div>;
    }

    return (
        <div className="seller-orders">
            <div className="orders-header">
                <div className="header-main">
                    <h1>Quản lý đơn hàng</h1>
                    <button className="refresh-btn" onClick={handleRefresh}>
                        <i className="fas fa-sync-alt"></i>
                        Làm mới
                    </button>
                </div>
                <div className="filter-section">
                    {filterOptions.map(filter => (
                        <button
                            key={filter.value}
                            className={`filter-button ${activeFilter === filter.value ? 'active' : ''}`}
                            onClick={() => handleFilterChange(filter.value)}
                        >
                            <i className={filter.icon}></i>
                            {filter.label}
                        </button>
                    ))}
                    <Pagination />
                </div>

            </div>

            <div className="table-container">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Ngày đặt</th>
                            <th>Sản phẩm</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.orderId}>
                                <td>#{order.orderId}</td>
                                <td>{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                                <td>
                                    <div className="products-cell">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="product-item">
                                                <span className="product-name">{item.productName}</span>
                                                <span className="product-variant">({item.skuName} x{item.quantity})</span>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="amount-cell">{formatCurrency(order.total)}₫</td>
                                <td>
                                    <span className={`status-badge ${orderStatus[order.status]?.color}`}>
                                        <i className={orderStatus[order.status]?.icon}></i>
                                        {orderStatus[order.status]?.label}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="action-btn view"
                                            onClick={() => handleViewDetail(order.orderId)}
                                            title="Xem chi tiết"
                                        >
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        {/* {order.status === 'completed' && (
                                            <button
                                                className="action-btn refund"
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setIsRefundModalOpen(true);
                                                }}
                                                title="Hoàn tiền"
                                            >
                                                <i className="fas fa-undo"></i>
                                            </button>
                                        )}
                                        <button
                                            className="action-btn report"
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setIsReportModalOpen(true);
                                            }}
                                            title="Báo cáo"
                                        >
                                            <i className="fas fa-flag"></i>
                                        </button> */}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            <RefundModal />
            <ReportModal />
            <OrderDetailModal />
        </div>
    );
}
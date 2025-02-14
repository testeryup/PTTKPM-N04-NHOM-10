import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../../ultils';
import { getOrders } from '../../../services/userService';
import UserHeader from '../UserHeader';
import Loading from '../../../components/Loading';
import { toast } from 'react-hot-toast';
import './MyOrders.scss';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false
  });
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();

  const filterOptions = [
    { value: 'all', label: 'Tất cả', icon: 'fas fa-list-ul' },
    { value: 'completed', label: 'Hoàn thành', icon: 'fas fa-check-circle' },
    { value: 'processing', label: 'Đang xử lý', icon: 'fas fa-clock' },
    { value: 'canceled', label: 'Đã huỷ', icon: 'fas fa-times-circle' }
  ];

  const orderStatus = {
    completed: { label: 'Hoàn thành', color: 'success', icon: 'fas fa-check-circle' },
    refunded: { label: 'Đã hoàn tiền', color: 'info', icon: 'fas fa-undo' },
    canceled: { label: 'Đã huỷ', color: 'danger', icon: 'fas fa-times-circle' },
    processing: { label: 'Đang xử lý', color: 'warning', icon: 'fas fa-clock' },
    pending: { label: 'Chờ xử lý', color: 'secondary', icon: 'fas fa-hourglass-half' },
    default: { label: 'Không xác định', color: 'default', icon: 'fas fa-question-circle' }
  };

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

  useEffect(() => {
    fetchOrders(pagination.currentPage, activeFilter);
  }, [pagination.currentPage, activeFilter]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const Pagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.currentPage - 2);
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`pagination-button ${pagination.currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          className="pagination-button nav"
          onClick={() => handlePageChange(1)}
          disabled={!pagination.hasPrev}
        >
          <i className="fas fa-angle-double-left" />
        </button>
        <button
          className="pagination-button nav"
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPrev}
        >
          <i className="fas fa-angle-left" />
        </button>

        {startPage > 1 && (
          <>
            <button className="pagination-button" onClick={() => handlePageChange(1)}>1</button>
            {startPage > 2 && <span className="pagination-ellipsis">...</span>}
          </>
        )}

        {pageNumbers}

        {endPage < pagination.totalPages && (
          <>
            {endPage < pagination.totalPages - 1 && <span className="pagination-ellipsis">...</span>}
            <button className="pagination-button" onClick={() => handlePageChange(pagination.totalPages)}>
              {pagination.totalPages}
            </button>
          </>
        )}

        <button
          className="pagination-button nav"
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNext}
        >
          <i className="fas fa-angle-right" />
        </button>
        <button
          className="pagination-button nav"
          onClick={() => handlePageChange(pagination.totalPages)}
          disabled={!pagination.hasNext}
        >
          <i className="fas fa-angle-double-right" />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <UserHeader />
        <div className="loading-container">
          <Loading />
        </div>
      </>
    );
  }

  return (
    <>
      <UserHeader />
      <div className="my-orders">
        <div className="orders-header">
          <div className="header-main">
            <h1>Đơn hàng của tôi</h1>
            <div className="orders-meta">
              <div className="meta-item">
                <i className="fas fa-shopping-bag"></i>
                <span>Tổng số đơn hàng: {pagination.totalItems}</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-file-alt"></i>
                <span>Trang {pagination.currentPage}/{pagination.totalPages}</span>
              </div>
            </div>
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
          </div>
        </div>

        <div className="orders-list">
          {orders.length === 0 ? (
            <div className="empty-orders">
              <i className="fas fa-shopping-bag"></i>
              <h3>Bạn chưa có đơn hàng nào</h3>
              <p>Hãy khám phá các sản phẩm của chúng tôi</p>
              <button onClick={() => navigate('/products')} className="browse-products-btn">
                <i className="fas fa-search"></i>
                Xem sản phẩm
              </button>
            </div>
          ) : (
            <>
              {orders.map(order => (
                <div key={order.orderId} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <div className="order-id">
                        <i className="fas fa-receipt"></i>
                        <span>#{order.orderId}</span>
                      </div>
                      <div className="order-date">
                        <i className="far fa-calendar-alt"></i>
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className={`status-badge ${orderStatus[order.status]?.color || orderStatus.default.color}`}>
                      <i className={orderStatus[order.status]?.icon || orderStatus.default.icon}></i>
                      <span>{orderStatus[order.status]?.label || orderStatus.default.label}</span>
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-details">
                          <h3>{item.productName}</h3>
                          <div className="item-meta">
                            <span className="sku-name">{item.skuName}</span>
                            <span className="quantity">
                              <i className="fas fa-times"></i>
                              {item.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="item-price">{formatCurrency(item.price)}₫</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div className="order-total">
                      <span>Tổng tiền:</span>
                      <span className="total-amount">{formatCurrency(order.total)}₫</span>
                    </div>
                    <button
                      className="view-order-btn"
                      onClick={() => handleViewOrder(order.orderId)}
                    >
                      <i className="fas fa-eye"></i>
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
              <Pagination />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MyOrders;
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderById } from '../../../services/userService';
import { formatCurrency } from '../../../ultils';
import { toast } from 'react-hot-toast';
import UserHeader from '../UserHeader';
import Loading from '../../../components/Loading';
import './OrderDetail.scss';

const OrderDetail = () => {
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());

  const orderStatus = {
    completed: { label: 'Hoàn thành', color: 'success' },
    refunded: { label: 'Đã hoàn tiền', color: 'info' },
    canceled: { label: 'Đã huỷ', color: 'danger' },
    processing: { label: 'Đang xử lý', color: 'warning' },
    pending: { label: 'Chờ xử lý', color: 'secondary' },
    default: { label: 'Không xác định', color: 'default' }
  };

  useEffect(() => {
    const fetchOrderData = async (orderId) => {
      try {
        const response = await getOrderById(orderId);
        if (response.errCode === 0 && response.data) {
          setOrderData(response.data);
        } else {
          toast.error('Không tìm thấy thông tin đơn hàng');
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
        toast.error('Có lỗi xảy ra khi tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderData(orderId);
    }
  }, [orderId]);

  const togglePassword = (inventoryId) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(inventoryId)) {
        newSet.delete(inventoryId);
      } else {
        newSet.add(inventoryId);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Đã sao chép ${type}`);
    } catch (err) {
      toast.error('Không thể sao chép');
    }
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

  // Group inventories by SKU
  const inventoriesBySku = orderData?.inventoryDetails.reduce((acc, inv) => {
    if (!acc[inv.sku]) {
      acc[inv.sku] = [];
    }
    acc[inv.sku].push(inv);
    return acc;
  }, {});

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

  if (!orderData) {
    return (
      <>
        <UserHeader />
        <div className="error-container">
          <h1>Không tìm thấy thông tin đơn hàng</h1>
        </div>
      </>
    );
  }

  const { label: statusLabel, color: statusColor } = 
    orderStatus[orderData.status] || orderStatus.default;

  return (
    <>
      <UserHeader />
      <div className="order-info">
        <div className="order-header">
          <div className="header-main">
            <h1>Chi tiết đơn hàng #{orderData.orderId}</h1>
            <span className={`status-badge ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <div className="header-meta">
            <span className="meta-item">
              <i className="far fa-clock" />
              {formatDate(orderData.createdAt)}
            </span>
            <span className="meta-item">
              <i className="far fa-credit-card" />
              #{orderData.transactionId}
            </span>
          </div>
        </div>

        <div className="order-summary">
          <div className="summary-card">
            <div className="summary-header">
              <h3>Thông tin thanh toán</h3>
            </div>
            <div className="summary-content">
              <div className="summary-row">
                <span>Tổng tiền</span>
                <span className="total-amount">{formatCurrency(orderData.total)}₫</span>
              </div>
              <div className="summary-row">
                <span>Trạng thái thanh toán</span>
                <span className={`payment-status ${orderData.paymentStatus}`}>
                  {orderStatus[orderData.paymentStatus]?.label || 'Chưa thanh toán'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="products-section">
          {orderData.skuDetails.map((sku) => (
            <div key={sku._id} className="product-card">
              <div className="product-header">
                <div className="product-info">
                  <h3>{sku.productName}</h3>
                  <p className="variant">{sku.name}</p>
                </div>
                <span className="price">{formatCurrency(sku.price)}₫</span>
              </div>

              <div className="accounts-grid">
                {inventoriesBySku[sku._id]?.map((inventory) => {
                  const [username, password] = inventory.credentials.split('|');
                  return (
                    <div key={inventory._id} className="account-card">
                      <div className="credential-field">
                        <label>
                          Tài khoản
                          <button
                            className="copy-btn"
                            onClick={() => copyToClipboard(username, 'tài khoản')}
                          >
                            <i className="far fa-copy" />
                          </button>
                        </label>
                        <div className="credential-value">{username}</div>
                      </div>

                      <div className="credential-field">
                        <label>
                          Mật khẩu
                          <button
                            className="copy-btn"
                            onClick={() => copyToClipboard(password, 'mật khẩu')}
                          >
                            <i className="far fa-copy" />
                          </button>
                        </label>
                        <div className="credential-value password">
                          <span>
                            {visiblePasswords.has(inventory._id) ? password : '••••••••'}
                          </span>
                          <button
                            className="toggle-btn"
                            onClick={() => togglePassword(inventory._id)}
                          >
                            <i className={`far fa-eye${visiblePasswords.has(inventory._id) ? '-slash' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default OrderDetail;
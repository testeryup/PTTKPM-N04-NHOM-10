import React, { useState, useEffect } from 'react';
import { getSellerStats } from '../../../services/sellerService';
import Loading from '../../../components/Loading';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../../ultils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Brush
} from 'recharts';
import './SellerMonitor.scss';

const MetricCard = ({ icon, title, value, change, format }) => (
    <div className="metric-card">
        <div className={`metric-icon ${Array.isArray(icon) ? icon[1] : ''}`}>
            <FontAwesomeIcon icon={icon} />
        </div>
        <div className="metric-info">
            <h3>{title}</h3>
            <p className="metric-value">{format ? format(value) : value}</p>
            {/* {change && (
                <p className={`metric-change ${parseFloat(change) >= 0 ? 'positive' : 'negative'}`}>
                    <i className={`fas fa-arrow-${parseFloat(change) >= 0 ? 'up' : 'down'}`}></i>
                    {Math.abs(parseFloat(change))}% so với hôm qua
                </p>
            )} */}
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="chart-tooltip">
                <p className="label">{label}</p>
                <div className="tooltip-value">
                    <span className="dot sales"></span>
                    <span>Doanh thu: {formatCurrency(payload[0].value)}₫</span>
                </div>
            </div>
        );
    }
    return null;
};

const RecentOrders = ({ orders }) => (
    <div className="recent-orders">
        <h3>Đơn hàng gần đây</h3>
        <div className="orders-list">
            {orders.map(order => (
                <div key={order.orderId} className="order-item">
                    <div className="sl-order-info">
                        <span className="sl-order-id">#{order.orderId}</span>
                        <span className="sl-buyer-name">{order.buyerName}</span>
                    </div>
                    <div className="sl-order-meta">
                        <span className={`order-status ${order.status}`}>
                            {order.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                        </span>
                        <span className="order-amount">{formatCurrency(order.total)}₫</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const TopProducts = ({ products }) => (
    <div className="top-products">
        <h3>Sản phẩm bán chạy</h3>
        <div className="products-list">
            {products.map(product => (
                <div key={product.id} className="product-item">
                    <div className="product-info">
                        <h4>{product.name}</h4>
                        <p className="sku-name">{product.sku}</p>
                    </div>
                    <div className="product-stats">
                        <span className="sold-count">{product.soldCount} đã bán</span>
                        <span className="revenue">{formatCurrency(product.revenue)}₫</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const SalesChart = ({ data }) => {
    const formatYAxis = value => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value;
    };

    return (
        <div className="chart-wrapper">
            <h3>Biểu đồ doanh thu</h3>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3498db" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3498db" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={formatYAxis}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#3498db"
                        fill="url(#salesGradient)"
                    />
                    <Brush dataKey="time" height={30} stroke="#3498db" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default function SellerMonitor() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('today');

    useEffect(() => {
        fetchStats();
    }, [timeRange]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await getSellerStats();
            if (response.errCode === 0) {
                setStats(response.data);
            } else {
                toast.error('Không thể tải thống kê');
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            toast.error('Đã có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) return <div className="loading-container"><Loading /></div>;

    return (
        <div className="seller-monitor">
            <div className="monitor-header">
                <h1>Tổng quan</h1>
                <div className="time-filter">
                    {['today', 'week', 'month'].map(range => (
                        <button
                            key={range}
                            className={`filter-btn ${timeRange === range ? 'active' : ''}`}
                            onClick={() => setTimeRange(range)}
                        >
                            {range === 'today' ? 'Hôm nay' :
                                range === 'week' ? 'Tuần này' : 'Tháng này'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="metrics-grid">
                <MetricCard
                    icon={["fas", "wallet"]}
                    title="Doanh thu"
                    value={stats.revenue[timeRange]}
                    change={stats.revenue.change}
                    format={formatCurrency}
                />
                <MetricCard
                    icon={["fas", "shopping-cart"]}
                    title="Đơn hàng"
                    value={stats.orders[timeRange]}
                    change={stats.orders.change}
                />
                <MetricCard
                    icon={["fas", "box"]}
                    title="Sản phẩm đã bán"
                    value={stats.products.sold}
                    change={stats.products.change}
                />
                <MetricCard
                    icon={["fa", "users"]}
                    title="Khách hàng mới"
                    value={stats.customers.new}
                    change={stats.customers.change}
                />
            </div>

            <div className="charts-section">
                <SalesChart data={stats.salesChart[timeRange]} />
            </div>

            <div className="details-grid">
                <RecentOrders orders={stats.recentOrders} />
                <TopProducts products={stats.topProducts} />
            </div>
        </div>
    );
}
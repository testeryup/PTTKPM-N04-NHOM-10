import React, { useState, useEffect } from 'react';
import './Overview.scss';
import { getAdminStats, getTransactionStats } from '../../services/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatCurrency } from '../../ultils';
import Loading from '../../components/Loading';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Line,
    LineChart
} from 'recharts';

export default function Overview() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('month');
    const [transactionStats, setTransactionStats] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsResponse, transactionResponse] = await Promise.all([
                    getAdminStats(),
                    getTransactionStats()
                ]);

                if (statsResponse.errCode === 0) {
                    setStats(statsResponse.data);
                }
                if (transactionResponse.errCode === 0) {
                    setTransactionStats(transactionResponse.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading || !stats || !transactionStats) return <Loading />;

    return (
        <div className="admin-overview">
            <div className="overview-header">
                <h1>Tổng quan hệ thống</h1>
                <div className="time-filter">
                    <button className='filter-btn'>Làm mới</button>
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
                <div className="metric-card">
                    <div className="metric-icon users">
                        <FontAwesomeIcon icon="users" />
                    </div>
                    <div className="metric-info">
                        <h3>Người dùng</h3>
                        <p className="metric-value">{stats.users.total.users}</p>
                        <div className="metric-details">
                            <span>Sellers: {stats.users.total.sellers}</span>
                            <span>Admins: {stats.users.total.admins}</span>
                            <span>Suspended: {stats.users.total.suspended}</span>
                        </div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon revenue">
                        <FontAwesomeIcon icon="wallet" />
                    </div>
                    <div className="metric-info">
                        <h3>Doanh thu</h3>
                        <p className="metric-value">{formatCurrency(stats.revenue[timeRange])}₫</p>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon orders">
                        <FontAwesomeIcon icon="shopping-cart" />
                    </div>
                    <div className="metric-info">
                        <h3>Đơn hàng</h3>
                        <p className="metric-value">{stats.orders[timeRange]}</p>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon deposits">
                        <FontAwesomeIcon icon="money-bill-wave" />
                    </div>
                    <div className="metric-info">
                        <h3>Nạp tiền</h3>
                        <p className="metric-value">{formatCurrency(stats.deposits[timeRange])}₫</p>
                    </div>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Doanh thu</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={stats.revenue.timeline}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis
                                tickFormatter={(value) => {
                                    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
                                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                                    return value;
                                }}
                            />
                            <Tooltip formatter={(value) => [`${formatCurrency(value)}₫`, 'Doanh thu']} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#0a59cc"
                                fill="#e7f0ff"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>Đơn hàng</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.orders.timeline}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis />
                            <Tooltip
                                formatter={(value) => [`${value} đơn hàng`, 'Số lượng']}
                                cursor={{ fill: 'rgba(46, 204, 113, 0.1)' }}
                            />
                            <Bar
                                dataKey="value"
                                fill="#2ecc71"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={50}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-card">
                    <h3>Người dùng mới</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.users.timeline}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis
                                allowDecimals={false}
                                tickCount={5}
                                domain={[0, 'auto']}
                            />
                            <Tooltip formatter={(value) => [`${value}`, 'Người dùng mới']} />
                            <Legend></Legend>
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#8884d8"
                                fill="#e7f0ff"
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>Giao dịch</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={transactionStats.chartData}>
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
                                strokeWidth={2}
                                activeDot={{ r: 8 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="withdrawal"
                                name="Rút tiền"
                                stroke="#e74c3c"
                                strokeWidth={2}
                                activeDot={{ r: 8 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="refund"
                                name="Hoàn tiền"
                                stroke="#f1c40f"
                                strokeWidth={2}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
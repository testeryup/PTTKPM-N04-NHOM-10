import React, { useState, useEffect } from 'react';
import { getAdminProducts, changeProductStatus, getProductStats } from '../../services/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatCurrency } from '../../ultils';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import './Products.scss';

export default function Products() {
    const [products, setProducts] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        status: 'all',
        seller: 'all',
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const [productsResponse, statsResponse] = await Promise.all([
                getAdminProducts(filters),
                getProductStats()
            ]);

            if (productsResponse.errCode === 0) {
                setProducts(productsResponse.data);
            }
            if (statsResponse.errCode === 0) {
                setStats(statsResponse.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const handleStatusChange = async (productId, newStatus) => {
        try {
            const response = await changeProductStatus(productId, newStatus);
            if (response.errCode === 0) {
                toast.success('Cập nhật trạng thái thành công');
                fetchProducts();
            } else {
                toast.error(response.message || 'Không thể cập nhật trạng thái');
            }
        } catch (error) {
            toast.error('Đã xảy ra lỗi khi cập nhật trạng thái');
        }
    };

    const handleSort = (field) => {
        setFilters(prev => ({
            ...prev,
            sortBy: field,
            sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
        }));
    };

    if (loading || !products) return <Loading />;

    return (
        <div className="admin-products">
            <div className="products-header">
                <h1>Quản lý sản phẩm</h1>
                <div className="stats-cards">
                    <div className="stat-card">
                        <h3>Tổng sản phẩm</h3>
                        <p>{products.pagination.totalItems}</p>
                    </div>
                    <div key={`active`} className="stat-card">
                        <h3>Đang bán</h3>
                        <p>{stats.statusStats[0].count}</p>
                    </div>
                    <div key={`inactive`} className="stat-card">
                        <h3>Tạm ngưng</h3>
                        <p>0</p>
                    </div>
                    <div key={`deleted`} className="stat-card">
                        <h3>Đã xóa</h3>
                        <p>0</p>
                    </div>
                    {/* {stats?.statusStats.map(stat => (
                        <div key={stat._id} className="stat-card">
                            <h3>{stat._id === 'active' ? 'Đang bán' :
                                stat._id === 'inactive' ? 'Tạm ngưng' : 'Đã xóa'}</h3>
                            <p>{stat.count}</p>
                        </div>
                    ))} */}
                </div>
            </div>

            <div className="filters-section">
                <div className="search-bar">
                    <FontAwesomeIcon icon="search" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    />
                </div>

                <div className="filter-group">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Đang bán</option>
                        <option value="inactive">Tạm ngưng</option>
                        <option value="deleted">Đã xóa</option>
                    </select>

                    <select
                        className="page-size-select"
                        value={filters.limit}
                        onChange={(e) => setFilters({ ...filters, limit: Number(e.target.value), page: 1 })}
                    >
                        <option value={10}>10 / trang</option>
                        <option value={20}>20 / trang</option>
                        <option value={50}>50 / trang</option>
                    </select>
                </div>
            </div>

            <div className="products-table">
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('name')}>
                                Tên sản phẩm
                                {filters.sortBy === 'name' && (
                                    <FontAwesomeIcon
                                        icon={filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'}
                                    />
                                )}
                            </th>
                            <th onClick={() => handleSort('price')}>
                                Giá
                                {filters.sortBy === 'price' && (
                                    <FontAwesomeIcon
                                        icon={filters.sortOrder === 'asc' ? 'sort-up' : 'sort-down'}
                                    />
                                )}
                            </th>
                            <th>SKU</th>
                            <th>Kho hàng</th>
                            <th>Đã bán</th>
                            <th>Người bán</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.products.map(product => (
                            <tr key={product._id}>
                                <td>{product.name}</td>
                                <td>{formatCurrency(product.price)}₫</td>
                                <td>{product.sku}</td>
                                <td>{product.stock}</td>
                                <td>{product.totalSold}</td>
                                <td>{product.sellerInfo?.username}</td>
                                <td>
                                    {/* <span className={`status-badge ${product.status}`}>
                                        {product.status === 'active' ? 'Đang bán' :
                                         product.status === 'inactive' ? 'Tạm ngưng' : 'Đã xóa'}
                                    </span> */}
                                    <span className={`status-badge active`}>
                                        Đang bán
                                    </span>
                                </td>
                                <td>
                                    <select
                                        className="status-select"
                                        value={product.status}
                                        onChange={(e) => handleStatusChange(product._id, e.target.value)}
                                    >
                                        <option value="active">Đang bán</option>
                                        <option value="inactive">Tạm ngưng</option>
                                        <option value="deleted">Xóa</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button
                    className="page-btn"
                    disabled={!products.pagination.hasPrev}
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                >
                    <FontAwesomeIcon icon="chevron-left" />
                </button>

                <span className="page-info">
                    Trang {products.pagination.currentPage} / {products.pagination.totalPages}
                </span>

                <button
                    className="page-btn"
                    disabled={!products.pagination.hasNext}
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                >
                    <FontAwesomeIcon icon="chevron-right" />
                </button>
            </div>
        </div>
    );
}
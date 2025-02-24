import React, { useState, useEffect } from 'react';
import { 
    getUserStats, 
    changeUserRole, 
    changeUserStatus,
    updateUser 
} from '../../services/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatCurrency } from '../../ultils';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import './Users.scss';
import EditUserModal from './EditUserModal';

export default function Users() {
    const [usersData, setUsersData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        role: 'all',
        status: 'all',
        search: ''
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await getUserStats(
                filters.page,
                filters.limit,
                filters.role,
                filters.status,
                filters.search
            );
            if (response.errCode === 0) {
                setUsersData(response.data);
            } else {
                toast.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('An error occurred while fetching users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [filters]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const response = await changeUserRole(newRole, userId);
            if (response.errCode === 0) {
                toast.success('Đã cập nhật vai trò người dùng');
                fetchUsers();
            } else {
                toast.error(response.message || 'Không thể cập nhật vai trò');
            }
        } catch (error) {
            console.error('Error changing user role:', error);
            toast.error('Đã xảy ra lỗi khi cập nhật vai trò');
        }
    };

    const handleStatusChange = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            const response = await changeUserStatus(newStatus, userId);
            if (response.errCode === 0) {
                toast.success(`Đã ${newStatus === 'active' ? 'mở khóa' : 'khóa'} tài khoản`);
                fetchUsers();
            } else {
                toast.error(response.message || 'Không thể cập nhật trạng thái');
            }
        } catch (error) {
            console.error('Error changing user status:', error);
            toast.error('Đã xảy ra lỗi khi cập nhật trạng thái');
        }
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: key === 'page' ? value : 1
        }));
    };
    const handleSaveUser = async (userData) => {
        try {
            const response = await updateUser(selectedUser._id, userData);
            if (response.errCode === 0) {
                toast.success('Cập nhật thông tin thành công');
                setIsEditModalOpen(false);
                setSelectedUser(null);
                fetchUsers();
            } else {
                toast.error(response.message || 'Không thể cập nhật thông tin');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Đã xảy ra lỗi khi cập nhật thông tin');
        }
    };
    const handleRefresh = () => {
        setFilters({
            page: 1,
            limit: 10,
            role: 'all',
            status: 'all',
            search: ''
        });
        fetchUsers();
    };

    if (loading || !usersData) return <Loading />;

    return (
        <div className="admin-users">
            <div className="users-header">
                <h1>Quản lý người dùng</h1>
                <button className="refresh-btn" onClick={handleRefresh}>
                    <FontAwesomeIcon icon="sync" /> Làm mới
                </button>
            </div>

            <div className="filters-section">
                <div className="search-bar">
                    <FontAwesomeIcon icon="search" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm người dùng..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <select
                        value={filters.role}
                        onChange={(e) => handleFilterChange('role', e.target.value)}
                    >
                        <option value="all">Tất cả vai trò ({usersData.filters.role.available.all})</option>
                        <option value="user">Người dùng ({usersData.filters.role.available.user})</option>
                        <option value="seller">Người bán ({usersData.filters.role.available.seller})</option>
                        <option value="admin">Admin ({usersData.filters.role.available.admin})</option>
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái ({usersData.filters.status.available.all})</option>
                        <option value="active">Hoạt động ({usersData.filters.status.available.active})</option>
                        <option value="suspended">Đã khóa ({usersData.filters.status.available.suspended || 0})</option>
                    </select>
                </div>
            </div>

            <div className="users-table">
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Số dư</th>
                            <th>Tổng chi tiêu</th>
                            <th>Số đơn hàng</th>
                            <th>Ngày tạo</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersData.users.map(user => (
                            <tr key={user._id}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>
                                    <div className="role-selector">
                                        <span className={`role-badge ${user.role}`}>
                                            {user.role === 'admin' ? 'Admin' :
                                                user.role === 'seller' ? 'Seller' : 'User'}
                                        </span>
                                        {user.role !== 'admin' && (
                                            <select
                                                className="role-change-select"
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            >
                                                <option value="user">User</option>
                                                <option value="seller">Seller</option>
                                            </select>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.status}`}>
                                        {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                                    </span>
                                </td>
                                <td>{formatCurrency(user.balance)}₫</td>
                                <td>{formatCurrency(user.totalSpent)}₫</td>
                                <td>{user.orderCount}</td>
                                <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    <button
                                        className="action-btn edit"
                                        title="Chỉnh sửa"
                                        onClick={() => handleEditClick(user)}
                                    >
                                        <FontAwesomeIcon icon="edit" />
                                    </button>
                                    <button
                                        className={`action-btn ${user.status === 'active' ? 'ban' : 'unban'}`}
                                        title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                                        onClick={() => handleStatusChange(user._id, user.status)}
                                        disabled={user.role === 'admin'}
                                    >
                                        <FontAwesomeIcon icon={user.status === 'active' ? 'ban' : 'unlock'} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button
                    className="page-btn"
                    disabled={!usersData.pagination.hasPrev}
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                >
                    <FontAwesomeIcon icon="chevron-left" />
                </button>

                <span className="page-info">
                    Trang {usersData.pagination.currentPage} / {usersData.pagination.totalPages}
                </span>

                <button
                    className="page-btn"
                    disabled={!usersData.pagination.hasNext}
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                >
                    <FontAwesomeIcon icon="chevron-right" />
                </button>

                <select
                    className="page-size-select"
                    value={filters.limit}
                    onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                >
                    <option value={10}>10 / trang</option>
                    <option value={20}>20 / trang</option>
                    <option value={50}>50 / trang</option>
                </select>
            </div>
            {isEditModalOpen && selectedUser && (
                <EditUserModal
                    user={selectedUser}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedUser(null);
                    }}
                    onSave={handleSaveUser}
                />
            )}
        </div>
    );
}
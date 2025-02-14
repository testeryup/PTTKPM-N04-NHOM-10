import './UserProfile.scss';
import UserHeader from '../UserHeader';
import { useSelector } from 'react-redux';
import Loading from '../../../components/Loading';
import { formatCurrency } from '../../../ultils';

export default function UserProfile() {
    const { profile, loading, error } = useSelector(state => state.user);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    if (loading) return <Loading />;
    if (error) return <div className="error-message">Error: {error}</div>;

    return (
        <>
            <UserHeader />
            <div className='profile-container'>
                <div className='profile-content'>
                    <div className='profile-header'>
                        <h1>Thông tin tài khoản</h1>
                    </div>
                    
                    <div className='profile-grid'>
                        <div className='profile-avatar'>
                            <div className='avatar'></div>
                            <button className='change-avatar-btn'>
                                <i className="fas fa-camera"></i>
                                Đổi ảnh đại diện
                            </button>
                            <div className='user-status'>
                                <span className={`status-badge ${profile?.status?.toLowerCase()}`}>
                                    {profile?.status || 'Chưa xác định'}
                                </span>
                            </div>
                        </div>

                        <div className='profile-details'>
                            <div className='detail-group'>
                                <label>Tên người dùng</label>
                                <div className='detail-value'>{profile?.username || 'Chưa cập nhật'}</div>
                            </div>

                            <div className='detail-group'>
                                <label>Email</label>
                                <div className='detail-value'>{profile?.email || 'Chưa cập nhật'}</div>
                            </div>

                            <div className='detail-group'>
                                <label>Số dư tài khoản</label>
                                <div className='detail-value highlight'>
                                    {profile?.balance >= 0 ? formatCurrency(profile.balance) : 0}₫
                                </div>
                            </div>

                            <div className='detail-group'>
                                <label>Vai trò</label>
                                <div className='detail-value role'>
                                    <i className="fas fa-user-shield"></i>
                                    {profile?.role || 'Chưa cập nhật'}
                                </div>
                            </div>

                            <div className='detail-group'>
                                <label>Ngày tham gia</label>
                                <div className='detail-value'>
                                    <i className="far fa-calendar-alt"></i>
                                    {profile?.createdAt ? formatDate(profile.createdAt) : 'Chưa cập nhật'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
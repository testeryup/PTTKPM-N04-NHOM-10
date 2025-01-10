import './UserProfile.scss';
import UserHeader from '../UserHeader';
import {useSelector} from 'react-redux';

export default function UserProfile() {
    const { profile, loading, error } = useSelector(state => state.user);
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    // if (!profile) return null;
    return (
        <>
            <UserHeader></UserHeader>
            {/* {JSON.stringify(profile)} */}
            <div className='profile-container'>
                <div className='profile-wrapper'>
                    <div className='profile'>
                        <div className='user-infor-table'>
                            <table>
                                <thead></thead>
                                <tbody>
                                    <tr>
                                        <td>Username</td>
                                        <td>{profile?.username ? profile.username : ''}</td>
                                    </tr>
                                    <tr>
                                        <td>Email</td>
                                        <td>{profile?.email ? profile.email : ''}</td>
                                    </tr>
                                    <tr>
                                        <td>Tài khoản</td>
                                        <td>{profile?.balance >= 0 ? `$ ${profile.balance}` : ''}</td>
                                    </tr>
                                    <tr>
                                        <td>Role</td>
                                        <td>{profile?.role ? profile.role : ''}</td>
                                    </tr>
                                    <tr>
                                        <td>Trạng thái</td>
                                        <td>{profile?.status ? profile.status : ''}</td>
                                    </tr>
                                    <tr>
                                        <td>Tham gia vào</td>
                                        <td>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ''}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className='avatar-container'>
                            <div className='avatar'></div>
                            <div className='change-avatar'>
                                <button>Đổi ảnh đại diện</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
import api from '../axios';

const getUserProfile = () => {
    console.log("check api header when get profile:", api.defaults.headers);
    return api.get('/api/user/profile');
}
const userService = {
    getUserProfile
}
export default userService;
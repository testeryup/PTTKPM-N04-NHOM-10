import UserHeader from "../Header/UserHeader"
import { logout } from "../../features/auth/authSlice";
import { useDispatch } from "react-redux";
import { path } from "../../ultils";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleLogout = async () => {
        await dispatch(logout());
        navigate(path.HOME);
    }
    const handleGoHome = () => {
        navigate(path.HOME);
    }
    return (
        <UserHeader></UserHeader>
    )
}
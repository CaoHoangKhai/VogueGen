import { Link } from 'react-router-dom';
import { FaUser, FaBookOpen, FaShoppingCart, FaHeart, FaCog } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './UserSidebar.css';

const UserSidebar = () => {
    return (
        <div className="user-sidebar bg-light border-end text-center">
            <div>
                <Link to={"/"} className="text-decoration-none quick-link text-secondary">
                    <h4 className="p-3 border-bottom">SHOPIFY</h4>
                </Link>
            </div>

            <ul className="list-group list-group-flush">
                <Link to="/user/profile" className="list-group-item list-group-item-action d-flex align-items-center">
                    <FaUser className="me-2" /> Thông tin cá nhân
                </Link>
                <Link to="/user/my-books" className="list-group-item list-group-item-action d-flex align-items-center">
                    <FaBookOpen className="me-2" /> Sách của tôi
                </Link>
                <Link to="/user/cart" className="list-group-item list-group-item-action d-flex align-items-center">
                    <FaShoppingCart className="me-2" /> Giỏ hàng
                </Link>
                <Link to="/user/favorites" className="list-group-item list-group-item-action d-flex align-items-center">
                    <FaHeart className="me-2" /> Yêu thích
                </Link>
                <Link to="/user/settings" className="list-group-item list-group-item-action d-flex align-items-center">
                    <FaCog className="me-2" /> Cài đặt
                </Link>
            </ul>
        </div>
    );
};

export default UserSidebar;

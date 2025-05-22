import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaTshirt, FaShoppingCart, FaHeart, FaCog, FaSignOutAlt, FaMapMarkerAlt  } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Sidebar.css';

const UserSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event("storage"));
    navigate('/signin');
  };

  return (
    <div className="user-sidebar bg-light border-end text-center">
      <div>
        <Link to="/" className="text-decoration-none quick-link text-secondary">
          <h4 className="p-3 border-bottom">SHOPIFY</h4>
        </Link>
      </div>

      <ul className="list-group list-group-flush">
        <Link to="/user/profile" className="list-group-item list-group-item-action d-flex align-items-center">
          <FaUser className="me-2" /> Thông tin cá nhân
        </Link>
        <Link to="/user/my-products" className="list-group-item list-group-item-action d-flex align-items-center">
          <FaTshirt className="me-2" /> Sản phẩm của tôi
        </Link>
        <Link to="/user/cart" className="list-group-item list-group-item-action d-flex align-items-center">
          <FaShoppingCart className="me-2" /> Giỏ hàng
        </Link>
        <Link to="/user/location" className="list-group-item list-group-item-action d-flex align-items-center">
          <FaMapMarkerAlt   className="me-2" /> Địa chỉ
        </Link>
        <Link to="/user/favorites" className="list-group-item list-group-item-action d-flex align-items-center">
          <FaHeart className="me-2" /> Yêu thích
        </Link>
        <Link to="/user/settings" className="list-group-item list-group-item-action d-flex align-items-center">
          <FaCog className="me-2" /> Cài đặt
        </Link>
        <button
          className="list-group-item list-group-item-action d-flex align-items-center border-0 bg-transparent"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="me-2" /> Đăng xuất
        </button>
      </ul>
    </div>
  );
};

export default UserSidebar;

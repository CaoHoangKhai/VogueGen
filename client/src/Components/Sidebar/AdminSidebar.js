import { Link, useNavigate } from 'react-router-dom';
import {
  FaUser, FaTshirt, FaPlus, FaList,
  FaShoppingCart, FaHeart, FaCog,
  FaSignOutAlt, FaChevronDown
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Sidebar.css';
import { useState } from 'react';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [showProductMenu, setShowProductMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin');
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

        <Link to="/admin/profile" className="list-group-item list-group-item-action d-flex align-items-center">
          <FaUser className="me-2" /> Thông tin quản trị
        </Link>

        {/* Nhóm Quản lý sản phẩm */}
        <li className="list-group-item list-group-item-action d-flex align-items-center justify-content-between"
          onClick={() => setShowProductMenu(!showProductMenu)}
          style={{ cursor: 'pointer' }}>
          <div>
            <FaTshirt className="me-2" /> Quản lý sản phẩm
          </div>
          <FaChevronDown className={`transition ${showProductMenu ? 'rotate-180' : ''}`} />
        </li>

        {showProductMenu && (
          <>
            <Link to="/admin/product_list" className="list-group-item list-group-item-action ps-5 text-start d-flex align-items-center">
              <FaList className="me-2" /> Danh sách sản phẩm
            </Link>
            <Link to="/admin/product_add" className="list-group-item list-group-item-action ps-5 text-start d-flex align-items-center">
              <FaPlus className="me-2" /> Thêm sản phẩm
            </Link>

          </>
        )}

        <Link to="/admin/orders" className="list-group-item list-group-item-action d-flex align-items-center">
          <FaShoppingCart className="me-2" /> Đơn hàng
        </Link>
        <Link to="/admin/favorites" className="list-group-item list-group-item-action d-flex align-items-center">
          <FaHeart className="me-2" /> Sản phẩm nổi bật
        </Link>
        <Link to="/admin/settings" className="list-group-item list-group-item-action d-flex align-items-center">
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

export default AdminSidebar;

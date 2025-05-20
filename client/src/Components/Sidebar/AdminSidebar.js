// src/Components/Sidebar/AdminSidebar.js
import { Link } from 'react-router-dom';
import {  FaBook, FaUsers, FaChartBar, FaCog } from 'react-icons/fa';


const AdminSidebar = () => {
  return (
    <div className="sidebar">
      <h3 className="sidebar-title">Admin Panel</h3>
      <ul className="sidebar-nav">
        <li>
          <Link to="/admin/dashboard">
            <FaChartBar className="sidebar-icon" /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/admin/users">
            <FaUsers className="sidebar-icon" /> Quản lý người dùng
          </Link>
        </li>
        <li>
          <Link to="/admin/books">
            <FaBook className="sidebar-icon" /> Quản lý sách
          </Link>
        </li>
        <li>
          <Link to="/admin/settings">
            <FaCog className="sidebar-icon" /> Cài đặt
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;

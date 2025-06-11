// components/Sidebar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import sidebarConfig from '../../config/sidebar';

import '../Sidebar/Sidebar.css';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    navigate('/auth/signin');
  };

  const toggleMenu = (index) => {
    setOpenMenu(openMenu === index ? null : index);
  };

  const menuItems = sidebarConfig[role] || [];

  return (
    <div className="user-sidebar bg-light border-end text-center">
      <Link to="/" className="text-decoration-none quick-link text-secondary">
        <h4 className="p-3 border-bottom">SHOPIFY</h4>
      </Link>

      <ul className="list-group list-group-flush">
        {menuItems.map((item, index) => (
          item.children ? (
            <div key={index}>
              <li
                className="list-group-item list-group-item-action d-flex align-items-center justify-content-between"
                style={{ cursor: 'pointer' }}
                onClick={() => toggleMenu(index)}
              >
                <div>
                  <item.icon className="me-2" /> {item.label}
                </div>
                <FaChevronDown className={`transition ${openMenu === index ? 'rotate-180' : ''}`} />
              </li>
              {openMenu === index && item.children.map((subItem, subIndex) => (
                <Link
                  key={subIndex}
                  to={subItem.path}
                  className="list-group-item list-group-item-action ps-5 text-start d-flex align-items-center"
                >
                  <subItem.icon className="me-2" /> {subItem.label}
                </Link>
              ))}
            </div>
          ) : (
            <Link
              key={index}
              to={item.path}
              className="list-group-item list-group-item-action d-flex align-items-center"
            >
              <item.icon className="me-2" /> {item.label}
            </Link>
          )
        ))}

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

export default Sidebar;

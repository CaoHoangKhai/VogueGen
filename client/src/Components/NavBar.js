import { Link } from 'react-router-dom';


const VerticalNavBar = () => {
  return (
    <div className="vertical-navbar">
      <ul className="navbar-nav flex-column">
        <li className="nav-item">
          <Link className="nav-link" to="/user">
            Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/user/profile">
            Profile
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/admin">
            Admin
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default VerticalNavBar;

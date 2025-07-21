import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Footer from './Footer';
import Header from './Header';
import CommonSidebar from './Sidebar/Sidebar';
import Forbidden403 from '../Page/Error/Forbidden403';

const Layout = ({ children }) => {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isUserRoute = location.pathname.startsWith('/user');
  const isDesignRoute = location.pathname.startsWith('/design');

  // 👤 Trạng thái người dùng
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // 🧠 Load user khi path thay đổi
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('user'));
      setUserData(data);
      if (data?.VaiTro_id === 1) setUserRole('admin');
      else if (data?.VaiTro_id === 0) setUserRole('user');
      else setUserRole(null);
    } catch (e) {
      setUserData(null);
      setUserRole(null);
    }
  }, [location.pathname]);

  // 🚫 Cấm truy cập trái phép
  if (
    (isAdminRoute && userRole !== 'admin') ||
    (isUserRoute && userRole !== 'user')
  ) {
    return <Forbidden403 />;
  }

  // 🎨 Layout riêng cho trang design
  if (isDesignRoute) {
    return <div>{children}</div>;
  }

  // 🧭 Layout cho admin và user (có sidebar)
  if (isAdminRoute || isUserRoute) {
    return (
      <div>
        <div style={sidebarStyle}>
          <CommonSidebar role={userRole} />
        </div>
        <div style={{ marginLeft: '250px', padding: '20px' }}>
          {children}
        </div>
      </div>
    );
  }

  // 👥 Layout mặc định cho khách
  return (
    <>
      <Header />
      <div>{children}</div>
      <Footer />
    </>
  );
};

// 🎨 Style sidebar (cố định trái)
const sidebarStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100vh',
  width: '250px',
  backgroundColor: '#fff',
  borderRight: '1px solid #ddd',
  zIndex: 1000,
  overflowY: 'auto',
};

export default Layout;

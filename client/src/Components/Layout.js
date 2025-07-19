import { useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Footer from './Footer';
import Header from './Header';
import CommonSidebar from './Sidebar/Sidebar';

const Layout = ({ children }) => {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isUserRoute = location.pathname.startsWith('/user');
  const isDesignRoute = location.pathname.startsWith('/design');

  // 👤 Trạng thái user
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // 🧠 Load lại user mỗi khi location thay đổi
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
  }, [location.pathname]); // 👈 cập nhật mỗi khi path đổi (login/logout/navigation)

  // 🚫 Cấm truy cập trái phép
  if (isAdminRoute && userRole !== 'admin') {
    return <Navigate to="/403" replace />;
  }

  if (isUserRoute && userRole !== 'user') {
    return <Navigate to="/403" replace />;
  }

  // 🎨 Layout riêng cho /design
  if (isDesignRoute) {
    return <div>{children}</div>;
  }

  // 🧭 Layout cho admin hoặc user
  if (isAdminRoute || isUserRoute) {
    return (
      <div>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: '250px',
            backgroundColor: '#fff',
            borderRight: '1px solid #ddd',
            zIndex: 1000,
            overflowY: 'auto',
          }}
        >
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

export default Layout;

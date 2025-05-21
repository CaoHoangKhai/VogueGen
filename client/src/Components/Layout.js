// src/Components/Layout.js
import Footer from './Footer';
import Header from './Header';
import AdminSidebar from './Sidebar/AdminSidebar';
import UserSidebar from './Sidebar/UserSidebar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isUser = location.pathname.startsWith('/user');

  return (
    <>
      {/* Chỉ render Header và Footer nếu KHÔNG PHẢI admin hoặc user */}
      {!isAdmin && !isUser && <Header />}

      <div style={{ display: 'flex' }}>
        {/* Hiển thị Sidebar tương ứng */}
        {isAdmin && <AdminSidebar />}
        {isUser && <UserSidebar />}

        {/* Nếu là admin/user thì khoảng cách lề sẽ là 250px, ngược lại là 0 */}
        <div style={{ 
          marginLeft: isAdmin || isUser ? '250px' : '50px', 
          marginTop: isAdmin || isUser ? '0px' : '60px', // 60px cho header
          width: '100%' 
        }}>
          {children}
        </div>
      </div>

      {/* Chỉ render Footer nếu KHÔNG PHẢI admin hoặc user */}
      {!isAdmin && !isUser && <Footer />}
    </>
  );
};

export default Layout;

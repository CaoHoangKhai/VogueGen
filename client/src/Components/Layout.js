// src/components/Layout.jsx
import Footer from './Footer';
import Header from './Header';
import CommonSidebar from './Sidebar/Sidebar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isUser = location.pathname.startsWith('/user');

  return (
    <>
      {!isAdmin && !isUser && <Header />}

      <div style={{ display: 'flex' }}>
        {isAdmin && <CommonSidebar role="admin" />}
        {isUser && <CommonSidebar role="user" />}

        <div style={{
          marginLeft: isAdmin || isUser ? '250px' : '50px',
          marginTop: isAdmin || isUser ? '0px' : '60px',
          width: '100%'
        }}>
          {children}
        </div>
      </div>

      {!isAdmin && !isUser && <Footer />}
    </>
  );
};

export default Layout;

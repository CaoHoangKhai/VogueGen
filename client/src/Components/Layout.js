import { useLocation } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';
import CommonSidebar from './Sidebar/Sidebar';

const Layout = ({ children }) => {
  const location = useLocation();

  const isAdmin = location.pathname.startsWith('/admin');
  const isUser = location.pathname.startsWith('/user');
  const isDesign = location.pathname.startsWith('/design');

  if (isDesign) {
    return (
      <>
        <div>{children}</div>
      </>
    );
  }

  if (isAdmin || isUser) {
    return (
      <>
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
            <CommonSidebar role={isAdmin ? 'admin' : 'user'} />
          </div>

          <div
            style={{
              marginLeft: '250px',
              padding: '20px',
            }}
          >
            {children}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div>{children}</div>
      <Footer />
    </>
  );
};

export default Layout;

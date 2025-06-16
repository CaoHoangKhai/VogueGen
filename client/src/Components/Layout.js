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
        <div        >
          {children}
        </div>
      </>
    );
  }

  if (isAdmin || isUser) {
    return (
      <>
        <div>
          <CommonSidebar role={isAdmin ? "admin" : "user"} />
          <div style={{
            marginLeft: '250px',
            marginTop: '0px',
          }}>
            {children}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ marginTop: '60px' }}>
        {children}
      </div>
      <Footer />
    </>
  );
};

export default Layout;

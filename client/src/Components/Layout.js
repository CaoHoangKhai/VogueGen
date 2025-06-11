import Footer from './Footer';
import Header from './Header';
import CommonSidebar from './Sidebar/Sidebar';
import SidebarDesign from '../Components/Sidebar/SidebarDesign';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isUser = location.pathname.startsWith('/user');
  const isDesign = location.pathname.startsWith('/design');

  // Chỉ hiện NavbarDesign cho trang /design, không hiện sidebar, header, footer
  if (isDesign) {
    return (
      <>
        <SidebarDesign />
        <div>
          {children}
        </div>
      </>
    );
  }

  // Layout cho admin và user
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

  // Layout mặc định (khách)
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
import { useLocation } from 'react-router-dom';
import { useState } from 'react'; // ✅ Bổ sung import

import Footer from './Footer';
import Header from './Header';
import CommonSidebar from './Sidebar/Sidebar';
import LeftSidebarDesign from './Sidebar/LeftSidebarDesign';

const Layout = ({ children }) => {
  const location = useLocation();
  const [selectedColor, setSelectedColor] = useState(null); // ✅ Thêm state này

  const isAdmin = location.pathname.startsWith('/admin');
  const isUser = location.pathname.startsWith('/user');
  const isDesign = location.pathname.startsWith('/design');

  if (isDesign) {
    return (
      <>
        <LeftSidebarDesign onColorChange={setSelectedColor} />
        <div
          style={{
            marginLeft: 270,
            marginTop: 0,
            minHeight: "100vh",
            background: "#f8f9fa"
          }}
        >
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

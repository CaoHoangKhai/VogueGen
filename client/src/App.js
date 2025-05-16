import 'bootstrap/dist/css/bootstrap.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './Page/Home';
import Header from './Components/Header';
import Footer from './Components/Footer';
import SignIn from './Page/SignIn';
import SignUp from './Page/SignUp';

import { createContext, useState } from 'react';

const MyContext = createContext();
function App() {

  const [isHeaderFooterShow, setisHeaderFooterShow] = useState(true);

  const values = {
    isHeaderFooterShow,
    setisHeaderFooterShow
  }

  return (
    <BrowserRouter>
      <MyContext.Provider value={values}>
        <Header />
       
        <Routes>

          {/*Trang Chủ*/}
          <Route path="/" exact={true} element={<HomePage />} />

          {/*Trang Đăng Nhập - Đăng Ký*/}
          <Route path="/signIn" exact={true} element={<SignIn />} />
          <Route path="/signUp" exact={true} element={<SignUp />} />

          {/*Policy*/}

          {/*User*/}


        </Routes>
        <Footer />
      </MyContext.Provider>
    </BrowserRouter>
  );
}

export default App;
export { MyContext }
import { createContext, useState } from 'react';

const MyContext = createContext();

const MyProvider = ({ children }) => {
  const [isHeaderFooterShow, setisHeaderFooterShow] = useState(true);

  const values = {
    isHeaderFooterShow,
    setisHeaderFooterShow
  }

  return (
    <MyContext.Provider value={values}>
      {children}
    </MyContext.Provider>
  );
};

export { MyContext, MyProvider };

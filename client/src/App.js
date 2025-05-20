import 'bootstrap/dist/css/bootstrap.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SignIn, SignUp } from './Page/Auth/Auth';
import { MyProvider } from './Context/AppContext';
import Layout from './Components/Layout';
import { Profile } from './Page/Users/User';
import HomePage from './Page/Home';

function App() {
  return (
    <BrowserRouter>
      <MyProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signIn" element={<SignIn />} />
            <Route path="/signUp" element={<SignUp />} />
            <Route path="/user" element={<Profile />} />
            <Route path="/admin" element={<div>Admin Page</div>} />
          </Routes>
        </Layout>
      </MyProvider>
    </BrowserRouter>
  );
}

export default App;

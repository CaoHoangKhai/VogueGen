import 'bootstrap/dist/css/bootstrap.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MyProvider } from './Context/AppContext';
import Layout from './Components/Layout';
import routes from './Router/routes';

function App() {
  return (
    <BrowserRouter>
      <MyProvider>
        <Layout>
          <Routes>
            {routes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
            <Route path="/admin" element={<div>Admin Page</div>} />
          </Routes>
        </Layout>
      </MyProvider>
    </BrowserRouter>
  );
}

export default App;

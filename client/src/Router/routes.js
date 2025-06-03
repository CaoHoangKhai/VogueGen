import Home from '../Page/Home';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import adminRoutes from './adminRoutes';
import productRoutes from './productRoutes';
const mainRoutes = [
  { path: '/', element: <Home /> },
  ...authRoutes,
  ...userRoutes,
  ...adminRoutes,
  ...productRoutes
];

export default mainRoutes;
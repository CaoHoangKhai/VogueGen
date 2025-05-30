import Home from '../Page/Home';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import adminRoutes from './adminRoutes';

const mainRoutes = [
  { path: '/', element: <Home /> },
  ...authRoutes,
  ...userRoutes,
  ...adminRoutes,
];

export default mainRoutes;
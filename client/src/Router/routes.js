import homeRoutes from './homeRoutes';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import adminRoutes from './adminRoutes';
import productRoutes from './productRoutes';
import designRoutes from './designRoutes';
import policyRoutes from './policyRoutes';
import guidesRoute from "./guidesRoutes";
import categoryRoutes from './categoryRoutes';

import NotFound404 from '../Page/Error/NotFound404'; // ✅ thêm import này

const mainRoutes = [
  ...homeRoutes,
  ...authRoutes,
  ...userRoutes,
  ...adminRoutes,
  ...productRoutes,
  ...designRoutes,
  ...policyRoutes,
  ...guidesRoute,
  ...categoryRoutes,

  // ✅ Route 404 phải đặt cuối cùng
  {
    path: '*',
    element: <NotFound404 />,
  },
];

export default mainRoutes;

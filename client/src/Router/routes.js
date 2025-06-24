import homeRoutes from './homeRoutes';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import adminRoutes from './adminRoutes';
import productRoutes from './productRoutes';
import designRoutes from './designRoutes';
import policyRoutes from './policyRoutes';


const mainRoutes = [
  ...homeRoutes,
  ...authRoutes,
  ...userRoutes,
  ...adminRoutes,
  ...productRoutes,
  ...designRoutes,
  ...policyRoutes
];

export default mainRoutes;
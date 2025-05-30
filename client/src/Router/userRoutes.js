import { Profile, UserLocation, OrderList } from '../Page/Users/User';

const userRoutes = [
  { path: '/user/profile', element: <Profile /> },
  { path: '/user/location', element: <UserLocation /> },
  { path: '/user/orders', element: <OrderList /> }
];

export default userRoutes;

import { Profile, UserLocation, OrderList,FavoriteList } from '../Page/Users/User';

const userRoutes = [
  { path: '/user/profile', element: <Profile /> },
  { path: '/user/location', element: <UserLocation /> },
  { path: '/user/orders', element: <OrderList /> },
  { path: '/user/favorites', element: <FavoriteList /> }
];

export default userRoutes;

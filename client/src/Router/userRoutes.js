import { Profile, UserLocation, OrderList,FavoriteList,MyDesign } from '../Page/Users/User';

const userRoutes = [
  { path: '/user/profile', element: <Profile /> },
  { path: '/user/location', element: <UserLocation /> },
  { path: '/user/orders', element: <OrderList /> },
  { path: '/user/favorites', element: <FavoriteList /> },
  { path: '/user/my-designs', element: <MyDesign /> }
];

export default userRoutes;

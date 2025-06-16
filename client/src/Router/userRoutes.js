import { Profile, UserLocation, OrderList,FavoriteList,MyDesign,OrderDetail  } from '../Page/Users/User';

const userRoutes = [
  { path: '/user/profile', element: <Profile /> },
  { path: '/user/location', element: <UserLocation /> },
  
  { path: '/user/orders', element: <OrderList /> },
  { path: '/user/order_detail/:id', element: <OrderDetail /> },
  { path: '/user/favorites', element: <FavoriteList /> },
  { path: '/user/my-designs', element: <MyDesign /> }
];

export default userRoutes;

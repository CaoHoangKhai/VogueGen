import Profile from '../Page/Users/Profile';
import UserLocation from '../Page/Users/Location/UserLocation';
import OrderList from '../Page/Users/Orders/Order_List';
import OrderDetail from '../Page/Users/Orders/Order_Detail';
import FavoriteList from '../Page/Users/Favorite/Favorite_List';
import MyDesign from '../Page/Users/Design/My_Design';

const userRoutes = [
  { path: '/user/profile', element: <Profile /> },
  { path: '/user/location', element: <UserLocation /> },

  { path: '/user/orders', element: <OrderList /> },
  { path: '/user/order_detail/:orderId', element: <OrderDetail /> },
  { path: '/user/favorites', element: <FavoriteList /> },
  { path: '/user/my-designs', element: <MyDesign /> }
];

export default userRoutes;

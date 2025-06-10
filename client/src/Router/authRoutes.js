import SignIn from '../Page/Auth/SignIn';
import SignUp from '../Page/Auth/SignUp';
import Order from '../Page/Auth/Order';
import Cart from '../Page/Auth/Cart';

const authRoutes = [
  { path: '/auth/signIn', element: <SignIn /> },
  { path: '/auth/signUp', element: <SignUp /> },

  { path: '/auth/order', element: <Order /> },
  { path: '/auth/cart', element: <Cart /> }
];

export default authRoutes;
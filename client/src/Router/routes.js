import Home from '../Page/Home';
import { SignIn, SignUp } from '../Page/Auth/Auth';
import { Profile } from '../Page/Users/User';

const routes = [
  { path: '/', element: <Home /> },
  { path: '/signIn', element: <SignIn /> },
  { path: '/signUp', element: <SignUp /> },
  { path: '/user/profile', element: <Profile /> },
];

export default routes;

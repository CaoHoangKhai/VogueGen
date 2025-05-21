import { SignIn, SignUp } from '../Page/Auth/Auth';

const authRoutes = [
  { path: '/signIn', element: <SignIn /> },
  { path: '/signUp', element: <SignUp /> },
];

export default authRoutes;

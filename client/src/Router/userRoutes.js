import { Profile, UserLocation } from '../Page/Users/User';

const userRoutes = [
  { path: '/user/profile', element: <Profile /> },
  { path: '/user/location', element: <UserLocation /> }
];

export default userRoutes;

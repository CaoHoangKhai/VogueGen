import Home from '../Page/Home';
import Contact from "../Page/About/Contact"
const homeRoutes = [
    { path: '/', element: <Home /> },
    { path: '/contact', element: <Contact /> },
    { path: '/about_us', element: <Contact /> },
];

export default homeRoutes;

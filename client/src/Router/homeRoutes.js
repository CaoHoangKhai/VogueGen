import Home from '../Page/Home';
import TryOn from '../Page/TryOn/TryOn';
import About from "../Page/About/About";
import News from "../Page/About/News";
import Contact from "../Page/About/Contact";

const homeRoutes = [
  { path: '/', element: <Home /> },
  { path: '/try-on', element: <TryOn /> },
  { path: '/about_us', element: <About /> },
  { path: '/news', element: <News /> },
  { path: '/contact', element: <Contact /> },
];

export default homeRoutes;

import LongSleevesDesign from "../Page/Design/LongSleevesDesign";
import PoloShirtDesign from "../Page/Design/PoloShirtDesign";
import TShirtDesigner from '../Page/Design/TShirtDesign';
import TankTopsDesign from "../Page/Design/TankTopsDesign";
import HoodieDesign from "../Page/Design/HoodieDesign";
import HatsDesign from "../Page/Design/HatsDesign";
const designRoutes = [
    {
        path: '/design/longsleeves/:id',
        element: <LongSleevesDesign />
    },
    {
        path: '/design/polo-shirts/:id',
        element: <PoloShirtDesign />
    },
    {
        path: '/design/tank-tops/:id',
        element: <TankTopsDesign />
    },
    {
        path: '/design/t-shirts/:id',
        element: <TShirtDesigner />
    },
    {
        path: '/design/hoodie/:id',
        element: <HoodieDesign />
    },
    {
        path: '/design/hats/:id',
        element: <HatsDesign />
    }
];

export default designRoutes;

import TShirtDesigner from '../Page/Design/TShirtDesign';

const designRoutes = [
    {
        //TShirt Designer
        path: '/design/quan_ao/:id',
        element: <TShirtDesigner />
    },
    {
        //Cup Designer
        path: '/design/cup/:id',
        element: <TShirtDesigner />
    }
];
export default designRoutes;
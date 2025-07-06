import HowToOrder from "../Page/Guides/HowToOrder";
import PurchaseTerms from "../Page/Guides/PurchaseTerms";

const guidesRoute = [
    {
        path: '/huong_dan/huong_dan_mua_hang',
        element: <HowToOrder />
    },
    {
        path: '/huong_dan/quy_trinh_doi_tra_hang',
        element: <PurchaseTerms />
    },

]
export default guidesRoute;
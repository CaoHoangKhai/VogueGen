import HowToOrder from "../Page/Guides/HowToOrder";
import PurchaseTerms from "../Page/Guides/PurchaseTerms";
import DesignGuide from "../Page/Guides/DesignGuide";
const guidesRoute = [
    {
        path: '/huong_dan/huong_dan_mua_hang',
        element: <HowToOrder />
    },
    {
        path: '/huong_dan/quy_trinh_doi_tra_hang',
        element: <PurchaseTerms />
    },
    {
        path: '/huong_dan/thiet_ke_ao',
        element: <DesignGuide />
    }

]
export default guidesRoute;
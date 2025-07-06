import PaymentMethods from '../Page/Policy/PaymentMethods';
import ReturnPolicy from '../Page/Policy/ReturnPolicy';
import PrivacyPolicy from '../Page/Policy/PrivacyPolicy';
import ShippingMethods from "../Page/Policy/ShippingMethods";
import ReturnProcess from "../Page/Policy/ReturnProcess";
const policyRoutes = [
    {
        path: '/chinh_sach/phuong_thuc_thanh_toan',
        element: <PaymentMethods />
    },
    {
        path: '/chinh_sach/phuong_thuc_giao_hang',
        element: <ShippingMethods />
    },
    {
        path: 'chinh_sach/chinh_sach_doi_tra',
        element: <ReturnPolicy />
    },
    {
        path: '/chinh_sach/chinh_sach_bao_mat',
        element: <PrivacyPolicy />
    },
        {
        path: '/chinh_sach/dieu_khoan_thanh_toan',
        element: <ReturnProcess />
    },
];

export default policyRoutes;
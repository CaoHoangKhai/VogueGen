import PaymentMethods from '../Page/Policy/Payment_Methods';
import ReturnPolicy from '../Page/Policy/Return_Policy';
import PrivacyPolicy from '../Page/Policy/Privacy_Policy';

const policyRoutes = [
    {
        path: '/phuong_thu_thanh_toan',
        element: <PaymentMethods />
    },
    {
        path: '/phuong_thuc_giao_hang',
        element: <ReturnPolicy />
    },
    {
        path: '/chinh_sach_doi_tra',
        element: <ReturnPolicy />
    },
    {
        path: '/chinh_sach_bao_mat',
        element: <PrivacyPolicy />
    }
];

export default policyRoutes;
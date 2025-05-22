import AdminDashboard from '../Page/Admin/AdminPage';
import ProductList from "../Page/Admin/Products/Product_List";
import ProductAdd from "../Page/Admin/Products/Product_Add";


const adminRoutes = [
  { path: '/admin/dashboard', element: <AdminDashboard /> },
  { path:'/admin/product_list', element:<ProductList /> },
  { path:'/admin/product_add', element:<ProductAdd /> },
];

export default adminRoutes;

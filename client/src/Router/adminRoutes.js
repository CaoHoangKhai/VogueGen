import AdminDashboard from '../Page/Admin/AdminPage';

import UserAdd from "../Page/Admin/Users/User_Add";
import UserList from "../Page/Admin/Users/User_List";

import ProductList from "../Page/Admin/Products/Product_List";
import ProductAdd from "../Page/Admin/Products/Product_Add";
import CategoryAdd from "../Page/Admin/Products/Category_Add";


const adminRoutes = [
  { path: '/admin/dashboard', element: <AdminDashboard /> },

  { path: '/admin/user_add', element: <UserAdd /> },
  { path: '/admin/user_list', element: <UserList /> },

  { path: '/admin/product_list', element: <ProductList /> },
  { path: '/admin/product_add', element: <ProductAdd /> },
  { path: '/admin/cacategory_add', element: <CategoryAdd /> },
];

export default adminRoutes;

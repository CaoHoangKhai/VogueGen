import AdminDashboard from '../Page/Admin/AdminPage';

import UserAdd from "../Page/Admin/Users/User_Add";
import UserList from "../Page/Admin/Users/User_List";

import ProductList from "../Page/Admin/Products/Product_List";
import ProductAdd from "../Page/Admin/Products/Product_Add";
import CategoryAdd from "../Page/Admin/Products/Category_Add";

import NewsList from "../Page/Admin/News/News_List";
import NewsAdd from "../Page/Admin/News/News_Add";
import NewsDetail from "../Page/Admin/News/News_Detail";

import PromotionsList from "../Page/Admin/Promotions/Promotions_List";
import PromotionsAdd from "../Page/Admin/Promotions/Promotions_Add";

const adminRoutes = [
  { path: '/admin/dashboard', element: <AdminDashboard /> },

  { path: '/admin/user_add', element: <UserAdd /> },
  { path: '/admin/user_list', element: <UserList /> },

  { path: '/admin/product_list', element: <ProductList /> },
  { path: '/admin/product_add', element: <ProductAdd /> },
  { path: '/admin/cacategory_add', element: <CategoryAdd /> },

  { path: '/admin/news_list', element: <NewsList /> },
  { path: '/admin/news_add', element: <NewsAdd /> },
  { path: '/admin/news_detail', element: <NewsDetail /> },

  { path: '/admin/promotions_list', element: <PromotionsList /> },
  { path: '/admin/promotions_add', element: <PromotionsAdd /> },

];

export default adminRoutes;

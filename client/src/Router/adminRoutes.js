import AdminDashboard from '../Page/Admin/AdminPage';

import UserAdd from "../Page/Admin/Users/User_Add";
import UserList from "../Page/Admin/Users/User_List";

import ProductList from "../Page/Admin/Products/Product_List";
import ProductAdd from "../Page/Admin/Products/Product_Add";
import ProductDetail from "../Page/Admin/Products/Product_Detail";
import CategoryAdd from "../Page/Admin/Products/Category_Add";

import NewsList from "../Page/Admin/News/News_List";
import NewsAdd from "../Page/Admin/News/News_Add";
import NewsDetail from "../Page/Admin/News/News_Detail";

import PromotionsList from "../Page/Admin/Promotions/Promotions_List";
import PromotionsAdd from "../Page/Admin/Promotions/Promotions_Add";

import OrderList from "../Page/Admin/Orders/Order_List";
import OrderDetail from "../Page/Admin/Orders/Order_Detail";

// const adminRoutes = [
//   { path: '/admin/dashboard', element: <AdminDashboard /> },

//   { path: '/admin/user_add', element: <UserAdd /> },
//   { path: '/admin/user_list', element: <UserList /> },

//   { path: '/admin/product_list', element: <ProductList /> },
//   { path: '/admin/product_add', element: <ProductAdd /> },
//   { path: '/admin/category_add', element: <CategoryAdd /> },

//   { path: '/admin/news_list', element: <NewsList /> },
//   { path: '/admin/news_add', element: <NewsAdd /> },
//   { path: '/admin/news_detail', element: <NewsDetail /> },

//   { path: '/admin/promotions_list', element: <PromotionsList /> },
//   { path: '/admin/promotions_add', element: <PromotionsAdd /> },

//   { path: '/admin/order_list', element: <OrderList /> },
//   { path: '/admin/order_detail/:id', element: <OrderDetail /> },
// ];

const adminRoutes = [
  
  { path: '/admin/dashboard', element: <AdminDashboard /> },

  { path: '/admin/users', element: <UserList /> },
  { path: '/admin/users/add', element: <UserAdd /> },

  { path: '/admin/products', element: <ProductList /> },
  { path: '/admin/products/add', element: <ProductAdd /> },
  { path: '/admin/products/detail/:id', element: <ProductDetail /> },
  { path: '/admin/products/category_add', element: <CategoryAdd /> },

  { path: '/admin/news', element: <NewsList /> },
  { path: '/admin/news/add', element: <NewsAdd /> },
  { path: '/admin/news/detail/:id', element: <NewsDetail /> },

  { path: '/admin/promotions', element: <PromotionsList /> },
  { path: '/admin/promotions/add', element: <PromotionsAdd /> },

  { path: '/admin/orders', element: <OrderList /> },
  { path: '/admin/orders/:id', element: <OrderDetail /> },
];


export default adminRoutes;

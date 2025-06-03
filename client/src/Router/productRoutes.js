import Products from "../Page/Products/Products";
import ProductDetail from "../Page/Products/Product_Detail";
const productRoutes = [
    {
        path: "/products/:category",
        element: <Products />
    },
    {
        path: "/products",
        element: <Products />
    },
    {
        path: "/products/detail/:id",
        element: <ProductDetail />
    },
];

export default productRoutes;

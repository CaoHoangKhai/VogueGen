import Products from "../Page/Products/Products";

const productRoutes = [
    {
        path: "/products/:category",
        element: <Products />
    },
    {
        path: "/products",
        element: <Products />
    },
];

export default productRoutes;

import ProductByCategory from "../Page/Category/ProductByCategory";
import Category from "../Page/Category/Category";
const categoryRoutes = [
    { path: '/category', element: <Category /> },
    { path: '/category/:id', element: <ProductByCategory /> },
]

export default categoryRoutes;
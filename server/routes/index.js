// Import các route con theo từng chức năng riêng biệt
const authRouter = require("./auth.route");         // Đăng ký, đăng nhập, xác thực người dùng
const userRouter = require("./user.route");         // Quản lý thông tin người dùng
const adminRouter = require("./admin.route");       // Dashboard, quản lý người dùng, trạng thái
const homeRouter = require("./home.route");         // Trang chủ, thông tin cơ bản
const favoriteRouter = require("./favorite.route"); // Danh sách sản phẩm yêu thích của người dùng
const cartRouter = require("./cart.route");         // Giỏ hàng, thêm/xóa/cập nhật sản phẩm
const designRouter = require("./design.route");     // Thiết kế áo, tạo, sửa, xóa thiết kế
const productRouter = require("./products.route");   // Quản lý sản phẩm, hình ảnh, màu sắc
const orderRouter = require("./order.route");
const categoryRoute = require("./category.route");
const sizeRouter = require("./size.route");
// Export hàm nhận vào app (Express instance)
module.exports = function (app) {
    // Mount các route vào đường dẫn tương ứng
    app.use("/auth", authRouter);         // → /auth/signup, /auth/signin,...
    app.use("/user", userRouter);         // → /user/:id, /user/location,...
    app.use("/admin", adminRouter);       // → /admin/dashboard, /admin/user_list,...
    app.use("/home", homeRouter);         // → /home (nếu có trang chủ riêng)
    app.use("/favorite", favoriteRouter); // → /favorite/toggle, /favorite/user/:id
    app.use("/cart", cartRouter);         // → /cart/add, /cart/user/:id,...
    app.use("/design", designRouter);     // → /design/create, /design/:id,...
    app.use("/products", productRouter);  // → /products, /products/:id,...
    app.use("/order", orderRouter),
        app.use("/category", categoryRoute),
        app.use("/size", sizeRouter);
};

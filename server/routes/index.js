const authRouter = require("./auth.route");
const userRouter = require("./user.route");
const adminRouter = require("./admin.route");
const homeRouter = require("./home.route");
const favoriteRouter = require("./favorite.route");
const cartRouter = require("./cart.route");
const designRouter = require("./design.route");
module.exports = function (app) {
    app.use("/auth", authRouter);
    app.use("/user", userRouter);
    app.use("/admin", adminRouter);
    app.use("/home", homeRouter);
    app.use("/favorite", favoriteRouter);
    app.use("/cart", cartRouter);
    app.use("/design", designRouter);
};

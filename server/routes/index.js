const authRouter = require("./auth.route");
const userRouter = require("./user.route");
const adminRouter = require("./admin.route");
const homeRouter = require("./home.route");

module.exports = function (app) {
    app.use("/auth", authRouter);
    app.use("/user", userRouter);
    app.use("/admin", adminRouter);
    app.use("/home", homeRouter);
};

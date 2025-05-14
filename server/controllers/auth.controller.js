const AuthService = require("../services/auth.services");
const MongoDB = require("../utils/mongodb.utils");
const ApiError = require("../api-error");

exports.signup = async (req, res, next) => {
    const {hoten, sodienthoai, matkhau, email} = req.body;
    if (!hoten || sodienthoai || !matkhau || !email) {
        return next(new ApiError(400, "Dữ liệu không hợp lệ! Vui lòng kiểm tra lại."));
    }

    try {
        const authService = new AuthService(MongoDB.client);
        const userId = await authService.signup(req.body);

        return res.status(201).json({ message: "Đăng ký thành công !", userId })

    } catch (error) {
        return next(new ApiError(500, `Lỗi đăng ký: ${error.message}`));
    }
};

exports.signin = async (req, res, next) => {
    const { email, matkhau } = req.body;
    if (!email || !matkhau) {
        return next(new ApiError(400, "Dữ liệu không hợp lệ! Vui lòng kiểm tra lại."));
    }
    try {

    } catch (error) {
        return next(new ApiError(500, `Lỗi đăng nhập: ${error.message}`));
    }

}
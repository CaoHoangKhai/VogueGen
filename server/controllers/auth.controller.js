const ApiError = require("../api-error");
const AuthService = require("../services/auth.service");
const MongoDB = require("../utils/mongodb.utils");
const messages = require("../utils/messages");

exports.register = async (req, res, next) => {
    try {
        const { hoten, email, sodienthoai, matkhau } = req.body;

        if (!hoten || !email || !sodienthoai || !matkhau) {
            return next(new ApiError(400, "Vui lòng nhập đầy đủ thông tin đăng ký."));
        }

        const authService = new AuthService(MongoDB.client);
        const user = await authService.register({ hoten, email, sodienthoai, matkhau });

        return res.status(201).json({ message: "Đăng ký thành công!", user });
    } catch (error) {
        console.error("Lỗi trong register controller:", error);
        return res.status(400).json({ message: error.message });
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, matkhau } = req.body;

        if (!email || !matkhau) {
            return next(new ApiError(400, "Email và mật khẩu là bắt buộc."));
        }

        const authService = new AuthService(MongoDB.client);

        const user = await authService.login({ email, matkhau });

        return res.status(200).json({
            message: "Đăng nhập thành công!",
            user
        });
    } catch (error) {
        console.error(error.message);

        
        return res.status(401).json({
            message: error.message || "Đăng nhập thất bại!"
        });
    }
};
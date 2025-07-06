const AuthService = require("../services/auth.service");
const MongoDB = require("../utils/mongodb.util");
const message = require("../utils/messages");

exports.signup = async (req, res, next) => {
    try {
        console.log("🔐 [SIGNUP] Yêu cầu đăng ký:", req.body);

        const { hoten, email, sodienthoai, matkhau } = req.body;

        if (!hoten || !email || !sodienthoai || !matkhau) {
            console.warn("⚠️ [SIGNUP] Thiếu thông tin đầu vào");
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin đăng ký." });
        }

        const authService = new AuthService(MongoDB.client);
        const user = await authService.signup({ hoten, email, sodienthoai, matkhau });

        console.log("✅ [SIGNUP] Đăng ký thành công:", user._id);
        return res.status(201).json({ message: "Đăng ký thành công!", user });
    } catch (error) {
        console.error("❌ [SIGNUP] Lỗi đăng ký:", error.message);

        return res.status(400).json({ message: message.error.REGISTER_FAILED });
    }
};

exports.signin = async (req, res, next) => {
    try {
        console.log("🔑 [SIGNIN] Yêu cầu đăng nhập:", req.body);

        const { email, matkhau } = req.body;

        if (!email || !matkhau) {
            console.warn("⚠️ [SIGNIN] Thiếu email hoặc mật khẩu");
            return res.status(400).json({ message: "Email và mật khẩu là bắt buộc." });
        }

        const authService = new AuthService(MongoDB.client);
        const user = await authService.signin({ email, matkhau });

        console.log("✅ [SIGNIN] Đăng nhập thành công:", user._id);
        return res.status(200).json({
            message: "Đăng nhập thành công!",
            user
        });
    } catch (error) {
        console.error("❌ [SIGNIN] Lỗi đăng nhập:", error.message);
        return res.status(401).json({
            message: error.message || "Đăng nhập thất bại!"
        });
    }
};

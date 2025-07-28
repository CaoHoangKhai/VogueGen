const AuthService = require("../services/auth.service");
const MongoDB = require("../utils/mongodb.util");
const message = require("../utils/messages");

// 📌 Đăng ký
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

// 📌 Đăng nhập
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

// 📌 Đổi mật khẩu
exports.changePassword = async (req, res) => {
    try {
        console.log("🔄 [CHANGE PASSWORD] Yêu cầu đổi mật khẩu:", req.body);

        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;

        // 🛡️ Kiểm tra input
        if (!oldPassword || !newPassword) {
            console.warn("⚠️ [CHANGE PASSWORD] Thiếu mật khẩu cũ hoặc mới");
            return res.status(400).json({ message: "Thiếu mật khẩu cũ hoặc mật khẩu mới." });
        }

        // ✅ Khởi tạo service
        const authService = new AuthService(MongoDB.client);

        // 🔄 Gọi service đổi mật khẩu
        const result = await authService.changePassword(id, oldPassword, newPassword);

        console.log("✅ [CHANGE PASSWORD] Đổi mật khẩu thành công cho user:", id);
        return res.status(200).json(result);
    } catch (err) {
        console.error("❌ [CHANGE PASSWORD] Lỗi:", err.message);
        return res.status(400).json({ message: err.message });
    }
};

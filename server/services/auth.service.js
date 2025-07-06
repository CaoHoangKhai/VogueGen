const bcrypt = require('bcrypt');
const { ObjectId } = require("mongodb");

class AuthService {
    constructor(client) {
        this.Auth = client.db().collection("nguoidung");
    }

    extractAuthData(payload) {
        return {
            hoten: payload.hoten,
            sodienthoai: payload.sodienthoai,
            matkhau: payload.matkhau,
            email: payload.email,
            VaiTro_id: 0,
            TrangThai_id: 1
        };
    }

    // Regex kiểm tra định dạng email & số điện thoại
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(sodienthoai) {
        const phoneRegex = /^(0|\+84)[0-9]{9}$/;
        return phoneRegex.test(sodienthoai);
    }

    async signup(payload) {
        const user = this.extractAuthData(payload);

        // 🔍 Validate dữ liệu đầu vào
        if (!user.hoten || !user.email || !user.sodienthoai || !user.matkhau) {
            throw new Error("Thiếu thông tin đầu vào.");
        }

        if (!this.isValidEmail(user.email)) {
            throw new Error("Email không hợp lệ.");
        }

        if (!this.isValidPhone(user.sodienthoai)) {
            throw new Error("Số điện thoại không hợp lệ.");
        }

        // ✅ Kiểm tra trùng lặp
        const emailExists = await this.checkEmail(user.email);
        if (emailExists) {
            throw new Error("Email đã tồn tại.");
        }

        const phoneExists = await this.checkSoDienThoai(user.sodienthoai);
        if (phoneExists) {
            throw new Error("Số điện thoại đã tồn tại.");
        }

        // 🔒 Băm mật khẩu
        const saltRounds = 10;
        user.matkhau = await bcrypt.hash(user.matkhau, saltRounds);

        // 🧾 Thêm vào CSDL
        const result = await this.Auth.insertOne(user);

        // Lấy user vừa tạo để trả về
        const newUser = await this.Auth.findOne({ _id: result.insertedId });

        delete newUser.matkhau; // Xóa mật khẩu băm

        return newUser;
    }

    async signin({ email, matkhau }) {
        if (!email || !matkhau) {
            throw new Error("Vui lòng nhập email và mật khẩu.");
        }

        const user = await this.checkEmail(email);
        if (!user) {
            throw new Error("Email không tồn tại.");
        }

        if (user.TrangThai_id !== 1) {
            throw new Error("Tài khoản đã bị khóa.");
        }

        const isMatch = await bcrypt.compare(matkhau, user.matkhau);
        if (!isMatch) {
            throw new Error("Mật khẩu không đúng.");
        }

        delete user.matkhau;

        return user;
    }

    async checkEmail(email) {
        return await this.Auth.findOne({ email });
    }

    async checkSoDienThoai(sodienthoai) {
        return await this.Auth.findOne({ sodienthoai });
    }
}

module.exports = AuthService;

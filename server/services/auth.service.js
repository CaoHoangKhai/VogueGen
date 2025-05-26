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

    // 🔒 Đăng ký độc giả mới với mã hóa mật khẩu
    async signup(payload) {
        const user = this.extractAuthData(payload);

        const emailExists = await this.checkEmail(user.email);
        if (emailExists) {
            throw new Error("Email đã tồn tại.");
        }

        const phoneExists = await this.checkSoDienThoai(user.sodienthoai);
        if (phoneExists) {
            throw new Error("Số điện thoại đã tồn tại.");
        }

        const saltRounds = 10;
        user.matkhau = await bcrypt.hash(user.matkhau, saltRounds);

        const result = await this.Auth.insertOne(user);

        return {
            id: result.insertedId,
            hoten: user.hoten,
            sodienthoai: user.sodienthoai,
            email: user.email, 
            VaiTro_id: user.VaiTro_id
        };
    }

    // 🔓 Đăng nhập bằng email + mật khẩu
    async signin({ email, matkhau }) {
        if (!email || !matkhau) {
            throw new Error("Vui lòng nhập email và mật khẩu.");
        }

        const user = await this.checkEmail(email);
        if (!user) {
            throw new Error("Email không tồn tại.");
        }

        // ⚠️ Kiểm tra trạng thái tài khoản
        if (user.TrangThai_id !== 1) {
            throw new Error("Tài khoản đã bị khóa");
        }

        const isMatch = await bcrypt.compare(matkhau, user.matkhau);
        if (!isMatch) {
            throw new Error("Mật khẩu không đúng.");
        }

        // Ẩn mật khẩu trước khi trả về
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

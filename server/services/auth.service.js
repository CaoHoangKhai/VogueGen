const bcrypt = require('bcrypt');
const { ObjectId } = require("mongodb");
const errorMessages = require("../utils/messages");

class AuthService {
    constructor(client) {
        this.Auth = client.db().collection("nguoidung");
    }

    extractAuthData(payload) {
        return {
            hoten: payload.hoten,
            sodienthoai: payload.sodienthoai,
            matkhau: payload.matkhau,
            email: payload.email
        };
    }

    //🔒 Đăng ký độc giả mới với mã hóa mật khẩu
    async register(payload) {
        const user = this.extractAuthData(payload);

        const emailExists = await this.checkEmail(user.email);
        if (emailExists) {
            throw new Error(errorMessages.EMAIL_NOT_FOUND);
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
            email: user.email
        };
    }

    async login({ email, sodienthoai, matkhau }) {
        if (!email && !sodienthoai) {
            throw new Error(errorMessages.MISSING_EMAIL_PHONE);
        }

        let user = null;

        if (email) {
            user = await this.checkEmail(email);
            if (!user) {
                throw new Error(errorMessages.EMAIL_NOT_FOUND);
            }
        }

        if (sodienthoai) {
            // Nếu đã tìm được user bằng email rồi, kiểm tra thêm số điện thoại phải khớp
            if (user && user.sodienthoai !== sodienthoai) {
                throw new Error("Email hoặc số điện thoại không chính xác.");
            } else {
                user = await this.checkPhone(sodienthoai);
                if (!user) {
                    throw new Error("Số điện thoại không tồn tại.");
                }
            }
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(matkhau, user.matkhau);
        if (!isMatch) {
            throw new Error("Mật khẩu không đúng.");
        }

        // Ở đây nếu muốn trả về user an toàn thì nên xóa hoặc ẩn trường mật khẩu trước khi return
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

const { ObjectId } = require("mongodb");

class UserService {
    constructor(client) {
        this.User = client.db().collection("nguoidung");
    }

    extractAuthData(payload) {
        return {
            hoten: payload.hoten,
            sodienthoai: payload.sodienthoai,
            // matkhau: payload.matkhau,
            email: payload.email,
            VaiTro_id: 0,
            TrangThai_id: 1
        };
    }

    async findUserById(id) {
        try {
            return await this.User.findOne(
                { _id: new ObjectId(id) },
                { projection: { matkhau: 0 } }
            );
        } catch (err) {
            console.error("Lỗi khi tìm người dùng:", err.message);
            return null;
        }
    }
}

module.exports = UserService;

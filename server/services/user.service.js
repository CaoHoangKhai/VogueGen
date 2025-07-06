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
            TrangThai_id: 1,
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

    async getUserLocations(userId) {
        console.log("🔍 [LocationService] Tìm địa chỉ cho user:", userId);

        let filter = {};
        try {
            filter = { manguoidung: new ObjectId(userId) };
        } catch (error) {
            console.warn("⚠️ [LocationService] Không thể chuyển userId thành ObjectId, dùng string:", userId);
            filter = { manguoidung: userId };
        }

        return await this.locations.find(filter).toArray();
    }

    async adminDashboard() {
        return await this.User.countDocuments({ VaiTro_id: 0 });
    }


    async toggleUserStatus(userId) {
        try {
            const user = await this.User.findOne({ _id: new ObjectId(userId) });
            if (!user) return false;

            const newStatus = user.TrangThai_id === 1 ? 0 : 1;

            const result = await this.User.updateOne(
                { _id: new ObjectId(userId) },
                { $set: { TrangThai_id: newStatus } }
            );

            return result.modifiedCount > 0;
        } catch (err) {
            console.error("Lỗi cập nhật trạng thái người dùng:", err.message);
            return false;
        }
    }

    async getListUser() {
        return await this.User.find(
            { VaiTro_id: 0 },
            { projection: { matkhau: 0 } }
        ).toArray();
    }

}

module.exports = UserService;

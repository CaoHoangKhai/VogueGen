const { ObjectId } = require("mongodb");

class LocationService {
    constructor(client) {
        this.Location = client.db().collection("diachinguoidung");
    }
    extractLocationData(payload) {
        return {
            manguoidung: payload.manguoidung,
            thanhpho: payload.thanhpho,
            quan_huyen: payload.quan_huyen,
            diachi: payload.diachi,
            trangthai: 1
        };
    }

    async addUserLocation(payload) {
        const locationData = this.extractLocationData(payload);
        const result = await this.Location.insertOne(locationData);
        return result.insertedId;  // Trả về ID bản ghi mới thêm
    }

    async deleteUserLocation(id) {
        if (!ObjectId.isValid(id)) {
            throw new Error("ID không hợp lệ");
        }
        const result = await this.Location.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }

    async getUserLocations(userId, limit = 5) {
        if (!userId) throw new Error("Thiếu mã người dùng");

        const cursor = await this.Location.find({
            manguoidung: userId,
            trangthai: 1
        })
            .limit(limit)
            .sort({ _id: -1 });

        return await cursor.toArray();
    }


    async countUserLocations(userId) {
        return await this.Location.countDocuments({
            manguoidung: userId.toString(),
            trangthai: 1
        });
    }
    async softDeleteUserLocation(id) {
    if (!ObjectId.isValid(id)) {
        throw new Error("ID không hợp lệ");
    }

    const result = await this.Location.updateOne(
        { _id: new ObjectId(id) },
        { $set: { trangthai: 0 } }
    );

    return result.modifiedCount > 0;
}






}

module.exports = LocationService;

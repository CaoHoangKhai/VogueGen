const { ObjectId } = require("mongodb");

class PromotionsService {
    constructor(client) {
        this.Promotions = client.db().collection("khuyenmai");
    }

    extractPromotionsData(payload) {
        return {
            makhuyenmai: payload.makhuyenmai,
            tenkhuyenmai: payload.tenkhuyenmai,
            nguoitao: payload.nguoitao,
            soluong: payload.soluong,
            ngaybatdau: payload.ngaybatdau,
            ngayketthuc: payload.ngayketthuc,
            trangthai: payload.trangthai,
            giamgia: payload.giamgia,
            dasudung: 0
        };
    }

    async create(payload) {
        const promotion = this.extractPromotionsData(payload);

        promotion.giamgia = Number(String(promotion.giamgia).replace("%", "").trim());
        promotion.ngaybatdau = new Date(promotion.ngaybatdau);
        promotion.ngayketthuc = new Date(promotion.ngayketthuc);

        if (promotion.ngaybatdau > promotion.ngayketthuc) {
            throw new Error("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.");
        }

        const existingCode = await this.Promotions.findOne({ makhuyenmai: promotion.makhuyenmai });
        if (existingCode) {
            throw new Error("Mã khuyến mãi đã tồn tại, vui lòng chọn mã khác.");
        }
        
        const result = await this.Promotions.insertOne(promotion);
        promotion._id = result.insertedId;
        return promotion;
    }


    async find(query = {}) {
        const cursor = await this.Promotions.find(query);
        return cursor.toArray();
    }

    async findById(id) {
        if (!ObjectId.isValid(id)) {
            return null;
        }

        return await this.Promotions.findOne({ _id: new ObjectId(id) });
    }

    async deactivateById(id) {
        if (!ObjectId.isValid(id)) {
            throw new Error("ID không hợp lệ.");
        }

        const promotion = await this.Promotions.findOne({ _id: new ObjectId(id) });
        if (!promotion) {
            throw new Error("Khuyến mãi không tồn tại.");
        }

        if (promotion.trangthai !== "1") {
            throw new Error("Khuyến mãi không ở trạng thái hoạt động.");
        }

        const result = await this.Promotions.updateOne(
            { _id: new ObjectId(id) },
            { $set: { trangthai: "0" } }
        );

        if (result.modifiedCount === 0) {
            throw new Error("Cập nhật trạng thái không thành công.");
        }

        return { id, trangthai: "0" };
    }
}

module.exports = PromotionsService;
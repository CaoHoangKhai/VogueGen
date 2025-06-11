const { ObjectId } = require("mongodb");

class DesignService {
    constructor(client) {
        this.design = client.db().collection("designs");
        this.theloaisanpham = client.db().collection("theloaisanpham");
        this.nguoidung = client.db().collection("nguoidung"); // Thêm collection người dùng
    }

    async createDesign({ manguoidung, theloai }) {
        if (!ObjectId.isValid(manguoidung)) throw new Error("ID người dùng không hợp lệ.");
        if (!ObjectId.isValid(theloai)) throw new Error("ID thể loại không hợp lệ.");

        // Kiểm tra người dùng có tồn tại không
        const user = await this.nguoidung.findOne({ _id: new ObjectId(manguoidung) });
        if (!user) {
            return {
                success: false,
                message: "Vui lòng đăng ký để sử dụng tính năng thiết kế."
            };
        }

        // Kiểm tra thể loại có tồn tại không
        const category = await this.theloaisanpham.findOne({ _id: new ObjectId(theloai) });
        if (!category) {
            return {
                success: false,
                message: "Thể loại không tồn tại. Vui lòng chọn thể loại hợp lệ."
            };
        }

        const designData = {
            manguoidung: new ObjectId(manguoidung),
            theloai: new ObjectId(theloai),
            ngaytao: new Date()
        };

        const result = await this.design.insertOne(designData);
        return {
            success: true,
            message: "Khởi tạo thiết kế thành công.",
            id: result.insertedId
        };
    }
}

module.exports = DesignService;
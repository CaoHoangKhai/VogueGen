const { ObjectId } = require("mongodb");

class CategoryServer {
    constructor(client) {
        this.Category = client.db().collection("theloaisanpham");
    }

    // Chuẩn hóa và xử lý dữ liệu danh mục đầu vào
    extractCategoryData(payload) {
        const rawName = (payload.tendanhmuc || "").trim();

        // Hàm viết hoa chữ cái đầu từng từ
        const formatName = rawName.replace(/\s+/g, ' ').split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");

        return {
            tendanhmuc: formatName
        };
    }

    // Thêm danh mục mới (nếu chưa tồn tại)
    async addCategory(payload) {
        const categoryData = this.extractCategoryData(payload);

        const existingCategory = await this.Category.findOne({
            tendanhmuc: { $regex: new RegExp(`^${categoryData.tendanhmuc}$`, "i") }
        });

        if (existingCategory) {
            return null; // Trùng tên
        }

        const result = await this.Category.insertOne(categoryData);
        return result.insertedId;
    }

    // Lấy tất cả danh mục
    async getAllCategories() {
        return await this.Category.find({}).toArray();
    }

    // Tìm danh mục theo ID
    async getCategoryById(id) {
        return await this.Category.findOne({ _id: new ObjectId(id) });
    }
}

module.exports = CategoryServer;

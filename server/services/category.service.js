const { ObjectId } = require("mongodb");

class CategoryServer {
    constructor(client) {
        this.Category = client.db().collection("theloaisanpham");
    }

    // Hàm chuẩn hóa dữ liệu danh mục đầu vào
    extractCategoryData(payload) {
        const rawName = (payload.tendanhmuc || "").trim();

        // 1. Format tên: viết hoa chữ cái đầu mỗi từ
        const formatName = rawName.replace(/\s+/g, ' ').split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");

        // 2. Tạo slug: chữ thường, không dấu, thay khoảng trắng thành dấu gạch dưới
        const slug = rawName
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")  // loại dấu tiếng Việt
            .replace(/\s+/g, "-")                             // khoảng trắng → gạch ngang
            .replace(/[^a-z0-9\-]/g, "");                     // chỉ giữ chữ thường, số và "-"

        return {
            tendanhmuc: formatName,
            slug: slug
        };
    }

    // Thêm danh mục mới nếu chưa tồn tại
    async addCategory(payload) {
        const categoryData = this.extractCategoryData(payload);

        // Kiểm tra trùng slug
        const existingCategory = await this.Category.findOne({
            slug: categoryData.slug
        });

        if (existingCategory) {
            return null; // Đã tồn tại
        }

        const result = await this.Category.insertOne(categoryData);
        return result.insertedId;
    }

    // Lấy toàn bộ danh mục
    async getAllCategories() {
        return await this.Category.find({}).toArray();
    }

    // Lấy danh mục theo ID
    async getCategoryById(id) {
        return await this.Category.findOne({ _id: new ObjectId(id) });
    }

    // Lấy danh mục theo slug (dùng cho URL routing frontend)
    async getCategoryBySlug(slug) {
        return await this.Category.findOne({ slug });
    }
    
}

module.exports = CategoryServer;

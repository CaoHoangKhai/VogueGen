const CategoryServer = require("../services/category.service");
const messages = require("../utils/messages");
const MongoDB = require("../utils/mongodb.util");

// 📥 Lấy tất cả danh mục
exports.getAllCategories = async (req, res, next) => {
    try {
        console.log("📥 [getAllCategories] Nhận yêu cầu...");

        const categoryServer = new CategoryServer(MongoDB.client);
        const categories = await categoryServer.getAllCategories();

        console.log("✅ [getAllCategories] Số lượng:", categories.length);

        if (!categories.length) {
            console.warn("⚠️ Không có danh mục nào được trả về.");
            return res.status(404).json({ message: "Không lấy được danh sách danh mục." });
        }

        return res.json(categories);
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách danh mục:", error);
        return res.status(500).json({ message: "Không lấy được danh sách danh mục." });
    }
};

// ➕ Thêm danh mục mới
exports.createCategory = async (req, res, next) => {
    try {
        console.log("📤 [createCategory] Dữ liệu nhận:", req.body);

        const categoryServer = new CategoryServer(MongoDB.client);

        // Thêm danh mục
        const result = await categoryServer.addCategory(req.body);

        if (!result) {
            console.warn("⚠️ [createCategory] Tên danh mục đã tồn tại:", req.body?.ten || "không có tên");
            return res.status(409).json({ message: "Tên danh mục đã tồn tại." });
        }

        console.log("✅ [createCategory] Thêm thành công với ID:", result);

        return res.status(201).json({
            message: "Thêm danh mục thành công.",
            insertedId: result
        });
    } catch (error) {
        console.error("❌ Lỗi khi thêm danh mục:", error);
        return res.status(500).json({ message: "Lỗi server khi thêm danh mục." });
    }
};

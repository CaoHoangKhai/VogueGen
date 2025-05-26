const CategoryServer = require("../services/category.service");
const messages = require("../utils/messages");
const MongoDB = require("../utils/mongodb.util");

exports.getAllCategories = async (req, res, next) => {
    try {
        const categorytServer = new CategoryServer(MongoDB.client);
        const categories = await categorytServer.getAllCategories();
        if (!categories.length) {
            return res.status(404).json({ message: "Không lấy được danh sách danh mục." });
        }
        return res.json(categories);
    } catch (error) {
        return res.status(500).json({ messages: "Không lấy được danh sách danh mục." })
    }
}

exports.createCategory = async (req, res, next) => {
    try {
        const categoryServer = new CategoryServer(MongoDB.client);

        // Thêm danh mục
        const result = await categoryServer.addCategory(req.body);

        if (!result) {
            return res.status(409).json({ message: "Tên danh mục đã tồn tại." });
        }

        return res.status(201).json({
            message: "Thêm danh mục thành công.",
            insertedId: result
        });
    } catch (error) {
        console.error("Lỗi khi thêm danh mục:", error);
        return res.status(500).json({ message: "Lỗi server khi thêm danh mục." });
    }
};



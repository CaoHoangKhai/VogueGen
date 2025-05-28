const SizesServer = require("../services/sizes.service");
const MongoDB = require("../utils/mongodb.util");

exports.getAllSizes = async (req, res, next) => {
    try {
        const sizesServer = new SizesServer(MongoDB.client);
        const sizes = await sizesServer.getAllSizes();
        if (!sizes.length) {
            return res.status(404).json({ message: "Không tìm thấy size nào cả." });
        }
        return res.json(sizes);
    } catch (error) {
        return res.status(500).json({ message: `Lỗi khi lấy danh sách size: ${error.message}` });
    }
};

const MongoDB = require("../utils/mongodb.util");
const DesignService = require("../services/design.service");

exports.createDesign = async (req, res) => {
    try {
        const { manguoidung, theloai } = req.body;
        const designService = new DesignService(MongoDB.client);
        const result = await designService.createDesign({ manguoidung, theloai });
        res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lưu thiết kế ảnh.",
            error: error.message
        });
    }
};

exports.getDesignsByUser = async (req, res) => {
    try {
        const { manguoidung } = req.params;
        const designService = new DesignService(MongoDB.client);
        const designs = await designService.getDesignsByUser(manguoidung);
        res.status(200).json(designs);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách thiết kế.",
            error: error.message
        });
    }
};
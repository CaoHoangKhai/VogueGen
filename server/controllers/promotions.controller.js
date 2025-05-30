const PromotionsService = require("../services/promotions.service");
const MongoDB = require("../utils/mongodb.util");
const message = require("../utils/messages");

exports.createPromotions = async (req, res, next) => {
    try {
        const promotionsService = new PromotionsService(MongoDB.client);
        const payload = req.body;
        const newPromotion = await promotionsService.create(payload);

        return res.status(201).json({
            message: "Tạo thành công!",
            data: newPromotion,
        });
    } catch (error) {
        return res.status(500).json({ message: `Lỗi không thể tạo được: ${error.message}` });
    }
};

exports.getPromotionById = async (req, res, next) => {
    try {
        const promotionsService = new PromotionsService(MongoDB.client);
        const id = req.params.id;

        const promotion = await promotionsService.findById(id);

        if (!promotion) {
            return res.status(400).json({
                message: "ID không hợp lệ hoặc không tìm thấy khuyến mãi",
            });
        }

        return res.status(200).json({
            message: message.FETCH_SUCCESS,
            data: promotion,
        });
    } catch (error) {
        return res.status(500).json({ message: `Đã xảy ra lỗi máy chủ: ${error.message}` });
    }
};

exports.getAllPromotions = async (req, res, next) => {
    try {
        const promotionsService = new PromotionsService(MongoDB.client);
        const promotions = await promotionsService.find();

        return res.status(200).json({
            message: message.FETCH_SUCCESS || "Lấy danh sách khuyến mãi thành công",
            data: promotions,
        });
    } catch (error) {
        return res.status(500).json({
            message: `Lỗi khi lấy danh sách khuyến mãi: ${error.message}`,
        });
    }
};

// Hàm mới đổi trạng thái từ "1" thành "0" theo id
exports.deactivatePromotionById = async (req, res, next) => {
    try {
        const promotionsService = new PromotionsService(MongoDB.client);
        const id = req.params.id;

        const updatedPromotion = await promotionsService.deactivateById(id);

        return res.status(200).json({
            message: "Đã đổi trạng thái khuyến mãi thành ngưng hoạt động.",
            data: updatedPromotion,
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message || "Lỗi khi đổi trạng thái khuyến mãi.",
        });
    }
};

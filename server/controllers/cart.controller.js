const CartService = require("../services/cart.service");
const MongoDB = require("../utils/mongodb.util");

exports.getCartByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const service = new CartService(MongoDB.client);
        const items = await service.getCartByUserId(userId);
        res.status(200).json(items);
    } catch (error) {
        res.status(400).json({ message: error.message || "Không thể lấy giỏ hàng." });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const service = new CartService(MongoDB.client);
        const result = await service.addToCart(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message || "Không thể thêm vào giỏ hàng." });
    }
};

exports.increaseQuantity = async (req, res) => {
    try {
        const cartService = new CartService(MongoDB.client);
        const result = await cartService.increaseQuantity(req.params.id);
        res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi tăng số lượng." });
    }
};

exports.decreaseQuantity = async (req, res) => {
    try {
        const cartService = new CartService(MongoDB.client);
        const result = await cartService.decreaseQuantity(req.params.id);
        res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi giảm số lượng." });
    }
};

exports.updateQuantity = async (req, res) => {
    try {
        const cartService = new CartService(MongoDB.client);
        // Lấy id từ params, quantity từ body
        const cartId = req.params.id;
        const quantity = req.body.quantity ?? req.body.soluong; // hỗ trợ cả hai tên

        if (typeof quantity !== "number") {
            return res.status(400).json({ success: false, message: "Thiếu hoặc sai kiểu số lượng." });
        }

        const result = await cartService.updateQuantity(cartId, quantity);
        res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật số lượng." });
    }
};
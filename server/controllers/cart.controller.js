const CartService = require("../services/cart.service");
const MongoDB = require("../utils/mongodb.util");

exports.getCartByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("📥 [getCartByUserId] userId:", userId);

        const service = new CartService(MongoDB.client);
        const items = await service.getCartByUserId(userId);

        console.log("✅ [getCartByUserId] items:", items);
        res.status(200).json(items);
    } catch (error) {
        console.error("❌ [getCartByUserId] Error:", error);
        res.status(400).json({ message: error.message || "Không thể lấy giỏ hàng." });
    }
};

exports.addToCart = async (req, res) => {
    try {
        console.log("📥 [addToCart] Body:", req.body);

        const service = new CartService(MongoDB.client);
        const result = await service.addToCart(req.body);

        console.log("✅ [addToCart] Result:", result);
        res.status(200).json(result);
    } catch (error) {
        console.error("❌ [addToCart] Error:", error);
        res.status(400).json({ message: error.message || "Không thể thêm vào giỏ hàng." });
    }
};

exports.increaseQuantity = async (req, res) => {
    try {
        const { cartId } = req.params;
        console.log("📥 [increaseQuantity] cartId:", cartId);

        const service = new CartService(MongoDB.client);
        const result = await service.increaseQuantity(cartId);

        console.log("✅ [increaseQuantity] Result:", result);
        res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
        console.error("❌ [increaseQuantity] Error:", error);
        res.status(500).json({ message: error.message || "Lỗi khi tăng số lượng." });
    }
};

exports.decreaseQuantity = async (req, res) => {
    try {
        const { cartId } = req.params;
        console.log("📥 [decreaseQuantity] cartId:", cartId);

        const service = new CartService(MongoDB.client);
        const result = await service.decreaseQuantity(cartId);

        console.log("✅ [decreaseQuantity] Result:", result);
        res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
        console.error("❌ [decreaseQuantity] Error:", error);
        res.status(500).json({ message: error.message || "Lỗi khi giảm số lượng." });
    }
};

exports.updateQuantity = async (req, res) => {
    try {
        const { cartId } = req.params;
        const quantity = req.body.quantity ?? req.body.soluong;

        console.log("📥 [updateQuantity] cartId:", cartId, "| quantity:", quantity);

        if (typeof quantity !== "number" || quantity < 0) {
            return res.status(400).json({ message: "Số lượng không hợp lệ." });
        }

        const service = new CartService(MongoDB.client);
        const result = await service.updateQuantity(cartId, quantity);

        console.log("✅ [updateQuantity] Result:", result);
        res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
        console.error("❌ [updateQuantity] Error:", error);
        res.status(500).json({ message: error.message || "Lỗi khi cập nhật số lượng." });
    }
};

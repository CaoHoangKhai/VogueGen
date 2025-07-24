const CartService = require("../services/cart.service");
const DesignService = require("../services/design.service");

const MongoDB = require("../utils/mongodb.util");

exports.getCartByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const cartService = new CartService(MongoDB.client);
        const designService = new DesignService(MongoDB.client);

        let cartItems = await cartService.getCartByUserId(userId);

        // Với mỗi item, nếu có madesign, thì lấy thêm chi tiết và link
        cartItems = await Promise.all(cartItems.map(async (item) => {
            if (item.madesign) {
                try {
                    const design = await designService.getDesignDetail(item.madesign);
                    const link = await designService.getDesignLink(item.madesign);

                    item.designInfo = design;       // Thông tin thiết kế đầy đủ
                    item.designLink = link || null; // Link thiết kế, nếu có
                } catch (err) {
                    console.warn("⚠️ Không tìm thấy thiết kế hoặc link:", item.madesign);
                    item.designInfo = null;
                    item.designLink = null;
                }
            } else {
                item.designInfo = null;
                item.designLink = null;
            }

            return item;
        }));

        res.status(200).json(cartItems);
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

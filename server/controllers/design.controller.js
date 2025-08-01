const MongoDB = require("../utils/mongodb.util");
const DesignService = require("../services/design.service");
const ProductServer = require("../services/product.service");
const { ObjectId } = require("mongodb");

exports.createDesign = async (req, res) => {
    try {
        const { manguoidung, theloai, masanpham, mausac } = req.body;

        console.log("🟡 [CREATE DESIGN] req.body:", req.body);

        const designService = new DesignService(MongoDB.client);
        const result = await designService.createDesign({ manguoidung, theloai, masanpham, mausac });

        console.log("🟢 [CREATE DESIGN] Result:", result);

        res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
        console.error("🔴 [CREATE DESIGN] Error:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi lưu thiết kế ảnh.", error: error.message });
    }
};

exports.getDesignsByUser = async (req, res) => {
    try {
        const { manguoidung } = req.params;
        console.log("📦 [GET DESIGNS BY USER] userId:", manguoidung);

        const designService = new DesignService(MongoDB.client);
        const designs = await designService.getDesignsByUser(manguoidung);

        console.log("📤 [GET DESIGNS BY USER] Designs:", designs.length);
        res.status(200).json(designs);
    } catch (error) {
        console.error("❌ [GET DESIGNS BY USER] Error:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách thiết kế.", error: error.message });
    }
};

exports.getDesignDetail = async (req, res) => {
    try {
        const { designId } = req.params; // ✅ updated
        console.log("🔎 [GET DESIGN DETAIL] ID:", designId);

        if (!ObjectId.isValid(designId)) {
            return res.status(400).json({ success: false, message: "ID thiết kế không hợp lệ." });
        }

        const designService = new DesignService(MongoDB.client);
        const result = await designService.getDesignDetail(new ObjectId(designId));

        res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi lấy chi tiết thiết kế.", error: error.message });
    }
};

exports.renameDesign = async (req, res) => {
    try {
        const { designId } = req.params; // ✅ updated
        const { ten } = req.body;

        if (!ten || ten.trim() === "") {
            return res.status(400).json({ success: false, message: "Tên không hợp lệ." });
        }

        const designService = new DesignService(MongoDB.client);
        const result = await designService.renameDesign(designId, ten.trim());

        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi đổi tên", error: err.message });
    }
};

exports.deleteDesign = async (req, res) => {
    try {
        const { designId } = req.params; // ✅ updated
        const designService = new DesignService(MongoDB.client);
        const result = await designService.deleteDesign(designId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi khi xóa thiết kế", error: err.message });
    }
};
// exports.saveUserDesign = async (req, res) => {
//     try {
//         const { designId, tshirtColor, designData } = req.body;
//         console.log("📝 [SAVE USER DESIGN] req.body:", req.body);

//         if (!designId || !designData || !tshirtColor) {
//             console.warn("⚠️ [SAVE USER DESIGN] Missing fields");
//             return res.status(400).json({ success: false, message: "Thiếu dữ liệu: designId, tshirtColor hoặc designData." });
//         }

//         const designService = new DesignService(MongoDB.client);
//         const result = await designService.saveUserDesignFull({ designId, color: tshirtColor, designData });

//         console.log("✅ [SAVE USER DESIGN] Result:", result);
//         return res.status(200).json(result);
//     } catch (error) {
//         console.error("❌ [SAVE USER DESIGN] Error:", error);
//         return res.status(500).json({ success: false, message: "Lỗi server khi lưu thiết kế.", error: error.message });
//     }
// };

exports.saveUserDesign = async (req, res) => {
    try {
        const { designId, tshirtColor, designData } = req.body;

        console.log("📝 [SAVE USER DESIGN] Dữ liệu nhận từ frontend:");
        console.log("👉 designId:", designId);
        console.log("👉 tshirtColor:", tshirtColor);
        console.log("👉 designData:", JSON.stringify(designData, null, 2));

        if (!designId || !designData || !tshirtColor) {
            return res.status(400).json({
                success: false,
                message: "Thiếu dữ liệu: designId, tshirtColor hoặc designData.",
            });
        }

        // ❌ Không lưu vào DB, chỉ phản hồi lại cho frontend
        return res.status(200).json({
            success: true,
            message: "Đã nhận dữ liệu thành công!",
            received: {
                designId,
                tshirtColor,
                designData,
            },
        });
    } catch (error) {
        console.error("❌ [SAVE USER DESIGN] Error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi xử lý dữ liệu.",
            error: error.message,
        });
    }
};


exports.getUserDesignByDesignId = async (req, res) => {
    try {
        const { designId } = req.params;
        console.log("🔎 [GET USER DESIGN] designId:", designId);

        const designService = new DesignService(MongoDB.client);
        const result = await designService.getUserDesignByDesignId(designId);

        if (!result.success) {
            console.warn("⚠️ [GET USER DESIGN] Not found");
            return res.status(404).json(result);
        }

        console.log("📥 [GET USER DESIGN] Success:", result);
        res.status(200).json(result);
    } catch (error) {
        console.error("❌ [GET USER DESIGN] Error:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy thiết kế người dùng.", error: error.message });
    }
};


exports.getColorFromDesign = async (req, res) => {
    try {
        const { designId } = req.params;
        // console.log("🎨 [GET COLOR FROM DESIGN] designId:", designId);

        if (!ObjectId.isValid(designId)) {
            // console.warn("⚠️ [GET COLOR FROM DESIGN] ID không hợp lệ");
            return res.status(400).json({ success: false, message: "Mã thiết kế không hợp lệ." });
        }

        const designService = new DesignService(MongoDB.client);
        const result = await designService.getColorFromDesign(designId);

        if (!result.success) {
            // console.warn("⚠️ [GET COLOR FROM DESIGN] Không tìm thấy màu");
            return res.status(404).json(result);
        }

        // console.log("✅ [GET COLOR FROM DESIGN] Result:", result);
        return res.status(200).json(result);
    } catch (err) {
        // console.error("🔥 [GET COLOR FROM DESIGN] Error:", err);
        return res.status(500).json({ success: false, message: "Lỗi server.", error: err.message });
    }
};

exports.getImagesByColorDesign = async (req, res) => {
    try {
        const { productId, color } = req.params;

        // console.log("📥 [getImagesByColorDesign] Nhận request với params:");
        // console.log("➡️ productId:", productId);
        // console.log("➡️ color:", color);

        // Kiểm tra hợp lệ
        if (!ObjectId.isValid(productId) || !/^#[0-9A-Fa-f]{6}$/.test(decodeURIComponent(color))) {
            console.warn("⚠️ Tham số không hợp lệ:", { productId, color });
            return res.status(400).json({
                success: false,
                message: "Tham số không hợp lệ (productId hoặc color)"
            });
        }

        const decodedColor = decodeURIComponent(color);
        // console.log("✅ Màu sau decode:", decodedColor);

        const designService = new DesignService(MongoDB.client);

        // console.log("🔍 Đang gọi service getImagesByColorDesign...");
        const result = await designService.getImagesByColorDesign(productId, decodedColor);

        // console.log("✅ Kết quả trả về từ service:", result);

        return res.status(result.success ? 200 : 500).json(result);
    } catch (err) {
        console.error("🔥 Lỗi tại controller getImagesByColorDesign:", err);
        return res.status(500).json({ success: false, message: "Lỗi server." });
    }
};

exports.saveUserDesign = async (req, res) => {
    try {
        const designService = new DesignService(MongoDB.client);
        const { madesign, masanpham, vitri, mau, overlays } = req.body;

        const result = await designService.saveUserDesign({
            madesign,
            masanpham,
            vitri,
            mau,
            overlays
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error("❌ Lỗi khi lưu thiết kế:", error.message);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi lưu thiết kế",
            error: error.message
        });
    }
};

exports.getDesignLink = async (req, res) => {
    try {
        const designId = req.params.designId;
        const designService = new DesignService(MongoDB.client);
        const link = await designService.getDesignLink(designId);  // link là chuỗi hoặc null

        if (!link) {
            return res.status(404).json({ success: false, message: 'Design không tồn tại hoặc không có link' });
        }

        return res.json({ success: true, link });
    } catch (error) {
        console.error('Lỗi khi lấy link design:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.getProductSizesFromDesignId = async (req, res) => {
    try {
        const designId = req.params.designId;
        const designService = new DesignService(MongoDB.client);
        const design = await designService.getProductSizesFromDesignId(designId);

        if (!design) {
            return res.status(404).json({ success: false, message: "❌ Design không tồn tại." });
        }

        return res.json({ success: true, data: design });
    } catch (error) {
        console.error("🔥 Lỗi khi lấy design theo ID:", error);
        return res.status(500).json({ success: false, message: "🚨 Lỗi server." });
    }
};

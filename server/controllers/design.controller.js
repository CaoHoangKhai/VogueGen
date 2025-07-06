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
exports.saveUserDesign = async (req, res) => {
    try {
        const { designId, tshirtColor, designData } = req.body;
        console.log("📝 [SAVE USER DESIGN] req.body:", req.body);

        if (!designId || !designData || !tshirtColor) {
            console.warn("⚠️ [SAVE USER DESIGN] Missing fields");
            return res.status(400).json({ success: false, message: "Thiếu dữ liệu: designId, tshirtColor hoặc designData." });
        }

        const designService = new DesignService(MongoDB.client);
        const result = await designService.saveUserDesignFull({ designId, color: tshirtColor, designData });

        console.log("✅ [SAVE USER DESIGN] Result:", result);
        return res.status(200).json(result);
    } catch (error) {
        console.error("❌ [SAVE USER DESIGN] Error:", error);
        return res.status(500).json({ success: false, message: "Lỗi server khi lưu thiết kế.", error: error.message });
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
        console.log("🎨 [GET COLOR FROM DESIGN] designId:", designId);

        if (!ObjectId.isValid(designId)) {
            console.warn("⚠️ [GET COLOR FROM DESIGN] ID không hợp lệ");
            return res.status(400).json({ success: false, message: "Mã thiết kế không hợp lệ." });
        }

        const designService = new DesignService(MongoDB.client);
        const result = await designService.getColorFromDesign(designId);

        if (!result.success) {
            console.warn("⚠️ [GET COLOR FROM DESIGN] Không tìm thấy màu");
            return res.status(404).json(result);
        }

        console.log("✅ [GET COLOR FROM DESIGN] Result:", result);
        return res.status(200).json(result);
    } catch (err) {
        console.error("🔥 [GET COLOR FROM DESIGN] Error:", err);
        return res.status(500).json({ success: false, message: "Lỗi server.", error: err.message });
    }
};

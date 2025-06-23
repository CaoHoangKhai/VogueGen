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


exports.getDesignById = async (req, res) => {
    try {
        const { id } = req.params;
        const designService = new DesignService(MongoDB.client);
        const design = await designService.getDesignById(id);
        if (!design) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thiết kế."
            });
        }
        res.status(200).json(design);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy chi tiết thiết kế.",
            error: error.message
        });
    }
};

exports.saveUserDesign = async (req, res) => {
  try {
    const { designId, tshirtColor, designData } = req.body;

    if (!designId || !designData || !tshirtColor) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu: designId, tshirtColor hoặc designData."
      });
    }

    const designService = new DesignService(MongoDB.client);
    const result = await designService.saveUserDesignFull({
      designId,
      color: tshirtColor,
      designData
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Lỗi khi lưu thiết kế người dùng:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lưu thiết kế.",
      error: error.message
    });
  }
};


exports.getUserDesignByDesignId = async (req, res) => {
    try {
        const { designId } = req.params;
        const designService = new DesignService(MongoDB.client);
        const result = await designService.getUserDesignByDesignId(designId);

        if (!result.success) {
            return res.status(404).json(result);
        }

        res.status(200).json(result);
    } catch (error) {
        console.error("❌ Lỗi khi lấy thiết kế người dùng:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy thiết kế người dùng.",
            error: error.message
        });
    }
};

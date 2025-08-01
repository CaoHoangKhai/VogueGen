const express = require("express");
const router = express.Router();
const designController = require("../controllers/design.controller");

// ================== ROUTES THIẾT KẾ ==================

router.post("/create", designController.createDesign);
router.post("/save", designController.saveUserDesign);
router.get("/user/:manguoidung", designController.getDesignsByUser);
router.get("/:designId", designController.getDesignDetail);

router.get('/link/:designId', designController.getDesignLink);
// router.post("/save-user-design", designController.saveUserDesign);
router.get("/user-design/:designId", designController.getUserDesignByDesignId);
router.patch("/rename/:designId", designController.renameDesign); // ✅
router.get("/colors/:designId", designController.getColorFromDesign);
router.get("/:designId/with-size", designController.getProductSizesFromDesignId);
router.delete("/:designId", designController.deleteDesign); // ✅
// routes/design.routes.js
router.get("/:productId/images/:color", designController.getImagesByColorDesign);

module.exports = router;

const express = require("express");
const router = express.Router();
const designController = require("../controllers/design.controller");

// ================== ROUTES THIẾT KẾ ==================

router.post("/create", designController.createDesign);
router.get("/user/:manguoidung", designController.getDesignsByUser);
router.get("/:designId", designController.getDesignDetail);
router.post("/save-user-design", designController.saveUserDesign);
router.get("/user-design/:designId", designController.getUserDesignByDesignId);
router.patch("/rename/:designId", designController.renameDesign); // ✅
router.get("/colors/:designId", designController.getColorFromDesign);
router.delete("/:designId", designController.deleteDesign); // ✅

module.exports = router;

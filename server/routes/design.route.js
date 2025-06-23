const express = require("express");
const router = express.Router();
const designController = require("../controllers/design.controller");

// Route để tạo thiết kế mới
router.post("/create", designController.createDesign);
router.get("/user/:manguoidung", designController.getDesignsByUser);

router.get("/:id", designController.getDesignById);


router.post("/save-user-design", designController.saveUserDesign);
router.get("/user-design/:designId", designController.getUserDesignByDesignId);
router.patch("/rename/:id", designController.renameDesign);

router.delete("/:id", designController.deleteDesign);

module.exports = router;
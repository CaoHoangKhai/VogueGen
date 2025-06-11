const express = require("express");
const router = express.Router();
const designController = require("../controllers/design.controller");

// Route để tạo thiết kế mới
router.post("/create", designController.createDesign);
router.get("/user/:manguoidung", designController.getDesignsByUser);
module.exports = router;
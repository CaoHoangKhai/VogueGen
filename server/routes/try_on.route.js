const express = require("express");
const router = express.Router();

const tryOnController = require("../controllers/try_on.controller");

// Thêm ảnh try-on (POST /tryon)
router.post("/", tryOnController.addTryOnImage);

// Xóa ảnh try-on theo id (DELETE /tryon/:id)
router.delete("/:id", tryOnController.deleteTryOnImage);

// Lấy danh sách ảnh try-on theo mã người dùng (GET /tryon/user/:manguoidung)
router.get("/user/:manguoidung", tryOnController.getTryOnImagesByUser);

module.exports = router;

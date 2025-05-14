const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

// Register
router.post("/signup", authController.signup);
router.get("/signup", (req, res) => {
    res.json({ message: "Trang Đăng Ký" });
});


router.post("/signin", authController.signup);
router.get("/signin", (req, res) => {
    res.json({ message: "Trang Đăng Nhập" });
});
module.exports = router;
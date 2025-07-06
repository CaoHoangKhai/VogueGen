const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const message = require("../utils/messages");

// ================== ROUTES XÁC THỰC NGƯỜI DÙNG ==================

/**
 * Đăng ký tài khoản người dùng
 * POST /auth/signup
 */
router.post("/signup", authController.signup);

/**
 * Đăng nhập tài khoản người dùng
 * POST /auth/signin
 */
router.post("/signin", authController.signin);

// (Optional - test route cho GET request)
router.get("/signup", (req, res) => {
    res.json({ message: message.info.SIGNIN_PAGE }); // Trang đăng nhập
});

router.get("/signin", (req, res) => {
    res.json({ message: message.info.SIGNUP_PAGE }); // Trang đăng ký
});

module.exports = router;

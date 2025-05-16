const express = require("express");
const authController = require("../controllers/auth.controller");
const message = require("../utils/messages");
const router = express.Router();

router.post("/register", authController.register);
router.get("/register", (req, res) => {
    res.json({ message: "Trang Đăng Ký" });
});

// Đăng nhập (POST)
router.post("/login", authController.login);
router.get("/login", (req, res) => {
    res.json({ message: message.Login });
});

module.exports = router;
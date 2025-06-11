const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const orderController = require("../controllers/order.controller");

const message = require("../utils/messages");

// POST /signup
router.post("/signup", authController.signup);

// GET /signup (test)
router.get("/signup", (req, res) => {
    res.json({ message: message.info.SIGNIN_PAGE });
});

// POST /signin
router.post("/signin", authController.signin);

// GET /signin (test)
router.get("/signin", (req, res) => {
    res.json({ message: message.info.SIGNUP_PAGE });
});

router.post("/order", orderController.createOrder);

module.exports = router;

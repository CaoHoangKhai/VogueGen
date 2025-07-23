const express = require("express");
const router = express.Router();
const sizeController = require("../controllers/sizes.controller");

// ================== ROUTES KÍCH THƯỚC ==================
router.get("/", sizeController.getAllSizes);

router.get("/design/:designId", sizeController.getSizesByDesignId);
module.exports = router;

const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const categorytController = require("../controllers/categories.controller")

const message = require("../utils/messages");

router.get("/", (req, res) => {
   res.json({ message: message.info.SIGNIN_PAGE });
});

router.get("/dashboard",adminController.adminDashboard);

router.get("/user_list",adminController.getListUsers);
router.patch("/user/status/:id", adminController.toggleUserStatus);
router.get("/getallcategories",categorytController.getAllCategories)
router.post("/addcategory",categorytController.createCategory)
module.exports = router;
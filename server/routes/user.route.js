const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const message = require("../utils/messages");
{/*Lấy thông tin người dùng*/}
router.get("/:id",userController.findOne);
router.get("/location/list", userController.getUserLocations);
router.post("/location", userController.addUserLocation);
router.delete("/location/:id",userController.deleteUserLocation);


module.exports = router;
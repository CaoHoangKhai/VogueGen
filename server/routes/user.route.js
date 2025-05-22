const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const message = require("../utils/messages");

router.get("/:id",userController.findOne);

router.post("/location", userController.addUserLocation);
router.get("/location/list", userController.getUserLocations);

module.exports = router;
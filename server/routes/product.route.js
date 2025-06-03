// gọi api lấy về các sản phẩm
const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");
const message = require("../utils/messages");


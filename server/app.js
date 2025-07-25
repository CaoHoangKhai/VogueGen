const express = require("express");
const cors = require("cors");
const routes = require("./routes"); // <-- Gọi file index.js trong thư mục routes
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use('/images', require('express').static(path.join(__dirname, 'public/images')));
// Gọi tất cả route đã gộp lại
routes(app);

// Route gốc
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Shopify" });
});

module.exports = app;

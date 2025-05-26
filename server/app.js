const express = require("express");
const cors = require("cors");
const routes = require("./routes"); // <-- Gọi file index.js trong thư mục routes

const app = express();

app.use(cors());
app.use(express.json());

// Gọi tất cả route đã gộp lại
routes(app);

// Route gốc
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Shopify" });
});

module.exports = app;

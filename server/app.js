const express = require("express");
const cors = require("cors");
const ApiError = require("./api-error");

const authRouter = require("./routes/auth.route");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth",authRouter);

app.get("/", (req, res) => {
res.json({message: "Welcome to website shopify"});
});

module.exports = app;
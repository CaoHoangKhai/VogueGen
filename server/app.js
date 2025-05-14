const express = require("express");
const cors = require("cors");

const authRouter = require("./routes/auth.route");

const ApiError = require("./api-error");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth",authRouter);

app.get("/",(req,res)=>{ 
    res.json({message: "Chào mừng tới website thời trang"});
});
app.use((req, res, next) => {
    return next(new ApiError(404, "Resource not found"));
});

app.use((error, req, res, next) => {
    return res.status(error.statusCode || 500).json({
        message: error.message || "Internal Server Error",
    });
});

module.exports = app;
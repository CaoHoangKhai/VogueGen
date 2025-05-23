const express =  require("express");
const cors = require("cors");

const authRouter = require("./routes/auth.route");
const userRouter = require("./routes/user.route");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/auth",authRouter);
app.use("/user", userRouter);
app.get("/", (req, res)=>{
    res.json({message:"Welcome to Shopify"});
});

module.exports = app;
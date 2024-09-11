const express = require("express");
const { connectDB } = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require('express-fileupload');
const {cloudinaryConnect} = require('./config/cloudinary');
require("dotenv").config();
const app = express();

const userRoute = require("./routes/user.router");

const PORT = process.env.PORT;

connectDB();
cloudinaryConnect();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use( 
    express.json()
);
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(cookieParser());
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp",
    })
);

app.use("/api/v1/auth", userRoute);

app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Your server has started successfully",
    });
});

app.listen(PORT, () => {
    console.log(`App is running at Port: ${PORT}`);
});
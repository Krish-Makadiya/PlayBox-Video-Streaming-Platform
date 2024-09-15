const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

exports.auth = async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization").replace("Bearer ", "");

        if (!token) {
            return res.json({
                success: false,
                message: "Token not found",
            });
        }

        const payload = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
        const user = await User.findById(new mongoose.Types.ObjectId(payload._id)).select(
            "-password -refreshToken"
        );
        
        if (!user) {
            return res.json({
                success: false,
                message: "user not found after verifying JWT Token",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(`ERROR: ${error}`);
        res.json({
            success: false,
            message: `UNABLE TO VERIFY JWT TOKEN: ${error.message}`,
        });
    }
};

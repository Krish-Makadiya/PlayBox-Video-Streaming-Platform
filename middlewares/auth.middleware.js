const User = require("../models/User.model");
const jwt = require("jsonwebtoken");

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

        const user = await User.findById(payload._id).select(
            "-password -refreshToken"
        );
        console.log(user);
        if (!user) {
            return res.json({
                success: false,
                message: "user not found after verifying JWT Token",
            });
        }

        res.user = user;
        next();
    } catch (error) {
        console.log(`ERROR: ${error}`);
        res.json({
            success: false,
            message: `UNABLE TO VERIFY JWT TOKEN: ${error.message}`,
        });
    }
};

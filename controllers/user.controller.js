const User = require("../models/User.model");
const { imageUploadCloudinary } = require("../config/uploadCloudinary");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
    try {
        // get user details, images from req
        const { username, email, password, fullName } = req.body;
        const { avtaarImage, coverImage } = req.files;

        // validation - not empty
        if (!username || !email || !fullName || !password || !avtaarImage) {
            return res.json({
                success: false,
                message: "Please Enter all fields",
            });
        }

        // check if user already exists
        const isUserPresent = await User.findOne({ email });
        if (isUserPresent) {
            return res.json({
                success: false,
                message: "Email is already registered",
            });
        }

        // upload to cloudinary
        const avtaarResponse = await imageUploadCloudinary(
            avtaarImage,
            process.env.CLOUDINARY_FOLDER_NAME
        );
        let coverResponse;
        if (coverImage) {
            coverResponse = await imageUploadCloudinary(
                coverImage,
                process.env.CLOUDINARY_FOLDER_NAME
            );
        }

        // create user object in DB
        const user = await User.create({
            username,
            email,
            password,
            fullName,
            avtaarImage: avtaarResponse.secure_url,
            coverImage: coverResponse?.secure_url || "",
        });

        // check for user creation
        if (!user) {
            return res.json({
                success: false,
                maessage: "User not created in DB",
            });
        }

        // return res
        return res.json({
            success: true,
            message: "User registered Successfully",
            data: user,
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
        res.json({
            success: false,
            message: `Error while Registering USER: ${error.message}`,
        });
    }
};

exports.loginUser = async (req, res) => {
    try {
        // data from req.body
        const { email, password } = req.body;

        // validate
        if (!email || !password) {
            return res.json({
                success: false,
                message: `Enter all fields`,
            });
        }

        // find email
        const user = await User.findOne({ email });

        // find user present or not
        if (!user) {
            return res.json({
                success: false,
                message: "User is not registered",
            });
        }

        // password check
        const isPasswordCorrect = await user.isPasswordCorrect(password);
        console.log(isPasswordCorrect);
        if (!isPasswordCorrect) {
            return res.json({
                success: false,
                message: "password is wrong",
            });
        }

        // generate access & refresh token
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // getting loggedIn User
        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );

        // send token in cookies
        const options = {
            httpOnly: true,
            secure: true,
        };
        return res
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                success: true,
                message: "User Logged In successfully",
                data: loggedInUser,
                accessToken: accessToken,
                refreshToken: refreshToken,
            });
    } catch (error) {
        console.log(`ERROR: ${error}`);
        res.json({
            success: false,
            message: `ERROR WHILE LOG IN USER: ${error.message}`,
        });
    }
};

exports.logoutUser = async (req, res) => {
    try {
        console.log(req.user);
        const id = req.user;

        await User.findByIdAndUpdate(
            id,
            {
                refreshToken: undefined,
            },
            { new: true }
        );

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
                success: true,
                message: "User logged out successfully",
            });
    } catch (error) {
        console.log(`ERROR: ${error}`);
        res.json({
            success: false,
            message: `ERROR DURING LOGOUT: ${error.message}`,
        });
    }
};

exports.refreshAccessToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken || req.body.refreshAccessToken;
        if (!token) {
            return res.json({
                success: false,
                message: "Token not found",
            });
        }

        const payload = await jwt.verify(token, JWT_REFRESH_TOKEN_SECRET);
        const user = await User.findById(payload._id);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found",
            });
        }

        if (token !== user.refreshToken) {
            return res.json({
                success: false,
                message: "Token not Matching",
            });
        }

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                success: true,
                message: "Access Token refreshed successfully",
            });
    } catch (error) {
        console.log(`ERROR: ${error}`);
        res.json({
            success: false,
            message: `ERROR WHILE REFRESHING TOKEN: ${error.message}`,
        });
    }
};

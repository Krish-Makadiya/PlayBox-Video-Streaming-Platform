const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const schema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        avtarImage: {
            type: String,
            required: true,
        },
        coverResponse: {
            type: String,
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        refreshToken: {
            type: String,
        },
    },
    { timestamps: true }
);

schema.pre("save", async function (next) {
    if (!this.isModified("passoword")) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

schema.methods.isPasswordCorrect = async function (password) {
    console.log(this.password);
    console.log(password);
    // console.log(await bcrypt.compare(password, this.password));
    return (password === this.password) ? true : false;
};

schema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            firstName: this.firstName,
        },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRE,
        }
    );
};

schema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.JWT_REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRE,
        }
    );
};

module.exports = mongoose.model("User", schema);

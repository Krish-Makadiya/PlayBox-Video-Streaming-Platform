const express = require("express");
const { auth } = require("../middlewares/auth.middleware");
const {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
} = require("../controllers/user.controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", auth, logoutUser);
router.post("/refresh-token", refreshAccessToken);

module.exports = router;

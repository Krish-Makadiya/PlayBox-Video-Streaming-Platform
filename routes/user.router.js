const express = require("express");
const { auth } = require("../middlewares/auth.middleware");
const {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccount,
    updateAvatarImage,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory,
} = require("../controllers/user.controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", auth, logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/change-password", auth, changeCurrentPassword);
router.get("/current-user", auth, getCurrentUser);
router.put("/update-account", auth, updateAccount);
router.put("/avtar-image", auth, updateAvatarImage);
router.put("/cover-image", auth, updateCoverImage);
router.get("/channel/:username", auth, getUserChannelProfile);
router.get("/watch-history", auth, getWatchHistory);

module.exports = router;

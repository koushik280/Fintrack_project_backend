const express = require("express");
const router = express.Router();
const UserController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", UserController.registerUser);
router.post("/login", UserController.loginUser);
router.post("/admin/login", UserController.adminLogin); // separate admin login
router.post("/logout", UserController.logoutUser);
router.get("/me", protect, UserController.getMe);
router.put("/me", protect, UserController.updateUser);
router.post("/refresh", UserController.refreshToken); // optional
router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password", UserController.resetPassword);
module.exports = router;


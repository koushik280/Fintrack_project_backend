const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const PasswordReset = require("../models/PasswordReset");
const crypto = require("crypto");
const { sendResetEmail } = require("../../utils/email");

// Generate tokens
const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "15m" }); // short-lived
};

const generateRefreshToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

class UserController {
  // @desc    Register a new user
  // @route   POST /api/auth/register
  async registerUser(req, res) {
    try {
      const { name, email, password } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      // Return user data (no token)
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }

  async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id, user.role);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        subscription: user.subscription,
        bio: user.bio,
        accessToken,
      });
    } catch (error) {
      console.error("Login error:", error.message);
      res.status(500).json({ message: "Server error" });
    }
  }

  async adminLogin(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (user.role !== "admin") {
        return res.status(403).json({ message: "Access denied: not an admin" });
      }

      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id, user.role);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        subscription: user.subscription,
        bio: user.bio,
        accessToken,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Logout user
  // @route   POST /api/auth/logout
  async logoutUser(req, res) {
    res.cookie("refreshToken", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: "Logged out successfully" });
  }

  // @desc    Get current user (protected)
  // @route   GET /api/auth/me
  async getMe(req, res) {
    try {
      const user = await User.findById(req.user.id).select("-password");
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Update user profile
  // @route   PUT /api/auth/me
  // @access  Private
  async updateUser(req, res) {
    try {
      const { name, email, bio } = req.body;
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.name = name || user.name;
      user.email = email || user.email;
      user.bio = bio || user.bio;
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        bio: user.bio,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Refresh access token (optional, for later)
  // @route   POST /api/auth/refresh
  async refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ message: "No refresh token" });

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return res.status(401).json({ message: "User not found" });

      const newAccessToken = generateAccessToken(user._id, user.role);
      res.json({ accessToken: newAccessToken });
    } catch (error) {
      res.status(403).json({ message: "Invalid refresh token" });
    }
  }

  // @desc    Forgot password - send reset email
  // @route   POST /api/auth/forgot-password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user)
        return res
          .status(404)
          .json({ message: "If that email exists a reset link will be sent" });
      const resetToken = crypto.randomBytes(32).toString("hex");
      await PasswordReset.create({
        user: user._id,
        token: resetToken,
        expiresAt: Date.now() + 3600000,
      });
      await sendResetEmail(user.email, resetToken);
      res
        .status(200)
        .json({ message: "Password reset link sent to your email" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Reset password
  // @route   POST /api/auth/reset-password
  async resetPassword(req, res) {
    try {
      const { token, newpassword } = req.body;
      const resetRecord = await PasswordReset.findOne({ token });
      if (!resetRecord || resetRecord.expiresAt < Date.now())
        return res.status(400).json({ message: "Invalid or expired token" });
      //check if the token is expired
      if (resetRecord.expiresAt < Date.now()) {
        await resetRecord.deleteOne();
        return res.status(400).json({ message: "Token has expired" });
      }

      const user = await User.findById(resetRecord.user);
      if (!user) return res.status(404).json({ message: "User not found" });

      //hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newpassword, salt);
      user.password = hashedPassword;
      await user.save();
      //delete used reset token
      await resetRecord.deleteOne();
      res
        .status(200)
        .json({ message: "Password reset successful. You can now log in" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new UserController();

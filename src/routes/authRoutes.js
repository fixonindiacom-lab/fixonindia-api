const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploads");

const {
  register,
  verifyOtpRegister,
  login,
  resendOtp,
  forgotPassword,
  resetPassword,
  completeProfile,
  getProfile,
} = require("../controllers/authController");

// Public routes
router.post("/register", register);
router.post("/verify-register", verifyOtpRegister);
router.post("/login", login);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.put("/profile", auth, upload.single("avatar"), completeProfile);

router.get("/profile", auth, getProfile);      // get profile

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});



module.exports = router;

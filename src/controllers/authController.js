const User = require("../models/user");
const TempVerification = require("../models/tempVerification");

const { sendEmail } = require("../utils/mailler");
const { generateOtp, hashOtp, verifyOtp } = require("../utils/otp");
const generateToken = require("../utils/jwt");

const bcrypt = require("bcrypt");

// ==============================
// 1. REGISTER → SEND OTP
// ==============================
// exports.register = async (req, res) => {
//   try {
//     const { name, email, phone, password } = req.body;

//     if (!name || !email || !phone || !password) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     const already = await User.findOne({ email });
//     if (already) return res.status(400).json({ message: "Email already exists" });

//     const otp = generateOtp();
//     const otpHash = await hashOtp(otp);

//     await TempVerification.findOneAndUpdate(
//       { email },
//       { email, phone, otpHash, expiresAt: new Date(Date.now() + 10 * 60 * 1000) }, // 10 mins
//       { upsert: true }
//     );

//     await sendEmail(email, "Verify your account", `Your OTP is: ${otp}`);

//     return res.json({ message: "OTP sent to email" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Register failed" });
//   }
// };



exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const already = await User.findOne({ email });
    if (already) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 1️⃣ Generate OTP
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    // 2️⃣ Save OTP FIRST
    await TempVerification.findOneAndUpdate(
      { email },
      {
        email,
        phone,
        otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
      { upsert: true }
    );

    console.log("REGISTER BODY:", req.body);
    console.log("OTP GENERATED FOR:", email , otp);


    // 3️⃣ Try sending email (OPTIONAL)
    const emailSent = await sendEmail(
      email,
      "Verify your account",
      `Your OTP is: ${otp}`
    );

    // 4️⃣ Always respond success
    return res.status(200).json({
      success: true,
      message: emailSent
        ? "OTP sent to email"
        : "OTP generated. Email may be delayed",
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Register failed" });
  }
};



// ==============================
// 2. VERIFY OTP → CREATE USER
// ==============================
exports.verifyOtpRegister = async (req, res) => {
  try {
    const { email, otp, password, name, phone } = req.body;

    const temp = await TempVerification.findOne({ email });
    if (!temp) return res.status(400).json({ message: "OTP expired or invalid" });

    const valid = await verifyOtp(otp, temp.otpHash);
    if (!valid) return res.status(400).json({ message: "Incorrect OTP" });

    const hashedPass = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPass,
      phone,
      verified: true,
      expireAt: undefined,
    });

    await TempVerification.deleteOne({ email });

    const token = generateToken(user);

    // // Save token in cookies
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // });

    return res.json({
      message: "Account verified",
      user,
      utoken : token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

// ==============================
// 3. LOGIN
// ==============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Wrong password" });

    const token = generateToken(user);

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    return res.json({ message: "Login success", user, utoken: token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};

// ==============================
// 4. RESEND OTP
// ==============================
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    await TempVerification.findOneAndUpdate(
      { email },
      { email, otpHash, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      { upsert: true }
    );

    await sendEmail(email, "New OTP", `Your OTP is: ${otp}`);

    return res.json({ message: "New OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Resend OTP failed" });
  }
};

// ==============================
// 5. FORGOT PASSWORD → SEND OTP
// ==============================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not registered" });

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    await TempVerification.findOneAndUpdate(
      { email },
      { email, otpHash, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      { upsert: true }
    );

    await sendEmail(email, "Reset Password OTP", `Your OTP is: ${otp}`);

    return res.json({ message: "OTP sent for password reset" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send reset OTP" });
  }
};

// ==============================
// 6. RESET PASSWORD USING OTP
// ==============================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const temp = await TempVerification.findOne({ email });
    if (!temp) return res.status(400).json({ message: "OTP expired" });

    const valid = await verifyOtp(otp, temp.otpHash);
    if (!valid) return res.status(400).json({ message: "Incorrect OTP" });

    const hashedPass = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate({ email }, { password: hashedPass });

    await TempVerification.deleteOne({ email });

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Password reset failed" });
  }
};

// ==============================
// 7. COMPLETE PROFILE (after login)
// ==============================

exports.completeProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { address, services, location } = req.body;

    const updatedFields = {
      address,
      services,
      // location,
    };

    // Add avatar if image uploaded
    if (req.file) {
      updatedFields.avatar = req.file.path;          // Cloudinary URL
      updatedFields.avatar_public_id = req.file.filename; // Cloudinary public_id
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updatedFields,
      { new: true, runValidators: true }
    );

    return res.json({
      message: "Profile updated successfully",
      user,
    });

  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
};





// ==============================
// 8. GET PROFILE (after login)
// ==============================
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get profile" });
  }
};


// exports.getProfile = async (req, res) => {
//   try {
//     return res.json({ user: req.user });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to get profile" });
//   }
// };





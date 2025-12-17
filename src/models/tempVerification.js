const mongoose = require("mongoose");

const tempVerificationSchema = new mongoose.Schema({
  email: { type: String, index: true },
  phone: { type: String, index: true },
  otpHash: String,
  expiresAt: { type: Date, index: { expires: 0 } }
});

const TempVerification = mongoose.model("TempVerification", tempVerificationSchema);

module.exports = TempVerification;
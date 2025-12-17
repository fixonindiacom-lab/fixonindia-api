const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },

    avatar: {
      type: String,
      default: "https://tse1.mm.bing.net/th/id/OIP.Sdwk-7MkBK1c_ap_eGCwxwHaHa?pid=Api&P=0&h=180",
    },

    address: {
      type: String,
      // required: [true, "Address is required"],
      default: "",
    },

    location: {
      type: [Number],   // Array of numbers
      default: [1, 1],  // default lat, lng
    },

    wallet: {
      type: Number,
      default: 0, // user’s wallet amount
    },

    services: {
      type: [String], // array of service names
      default: [],    // empty by default
    },

    verified: {
      type: Boolean,
      default: false,
    },

    // This field is ONLY for TTL auto delete
    expireAt: {
      type: Date,
      default: function () {
        // If not verified, set delete time = now + 3 days
        return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      },
      expires: 0, // MongoDB TTL index (auto delete)
    },
  },
  { timestamps: true }
);

// If the user becomes verified → remove auto-delete timer
userSchema.pre("save", async function () {
  if (this.verified === true) {
    this.expireAt = undefined;
  }
});


module.exports = mongoose.model("User", userSchema);

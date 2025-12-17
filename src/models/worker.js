const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
  {
    profilePic: {
      type: String, // Cloudinary URL
      required: false,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    workerId: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    aadharPic: {
      type: String, // Cloudinary URL
      required: true,
    },

    panPic: {
      type: String, // Cloudinary URL
      required: true,
    },

    city:{
      type: String, // Cloudinary URL
      required: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    workeds: {
      type: Number, // total days/months worked
      default: 0,
    },

    tasksCompleted: {
      type: Number,
      default: 0,
    },

    tasksPending: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number, // percentage
      min: 0,
      max: 100,
      default: 0,
    },

    verified: {
      type: Boolean,
      default: false,
    },
    location: {
      type: [Number],   // Array of numbers
      default: [1, 1],  // default lat, lng
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Worker", workerSchema);

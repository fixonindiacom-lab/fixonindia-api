const User = require("./user");
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },

    // service: { type: String, required: true },
    service: {
  type: [String],
  required: true,
},


    location: {
      address: String,
      lat: Number,
      lng: Number,
    },

    phone:{
        type: Number , 
    },

    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      default: null ,
    },

    wrkr:{
      type:String
    },

    // Live worker location (GeoJSON)
    workerLiveLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
      updatedAt: Date,
    },

    payment: {
      method: {
        type: String,
        enum: ["online", "offline"],
        default: "offline",
      },
      status: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending",
      },
      transactionId: String,
      amount: { type: Number, required: true },
    },

    taskStatus: {
      type: String,
      enum: ["requested", "accepted", "in-progress", "completed", "cancelled"],
      default: "requested",
    },

    scheduledDate: String,
    scheduledTime: String,
  },
  { timestamps: true }
);


bookingSchema.post("save", async function (doc) {
  try {
    // booking.username contains USER ID as string
    const userId = doc.username;

    // validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid userId in booking.username");
      return;
    }

    await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          services: doc._id.toString(), // or doc.service
        },
      },
      { new: true }
    );

  } catch (error) {
    console.error("Auto user service update failed:", error.message);
  }
});


bookingSchema.index({ workerLiveLocation: "2dsphere" });

module.exports = mongoose.model("Booking", bookingSchema);

const Worker = require("../models/worker");
const generateToken = require("../utils/jwt");

// helper: generate workerId = city + random + address
const generateWorkerId = (city, address) => {
  const random = Math.floor(10000 + Math.random() * 90000); // 5 digit random
  return `${city}-${random}-${address.substring(0, 5).replace(/\s+/g, "")}`;
};

// ========================
// REGISTER WORKER WITH IMAGE UPLOAD
// ========================
exports.registerWorker = async (req, res) => {
  try {
    const { name, email, phone, address, city } = req.body;

    if (!name || !email || !phone || !address || !city) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check existing email
    const exists = await Worker.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Worker already registered with this email" });
    }

    // FILES: profilePic, aadharPic, panPic
    const profilePicFile = req.files?.find(f => f.fieldname === "profilePic");
    const aadharPicFile = req.files?.find(f => f.fieldname === "aadharPic");
    const panPicFile = req.files?.find(f => f.fieldname === "panPic");


    if (!profilePicFile || !aadharPicFile || !panPicFile) {
      return res.status(400).json({ message: "All documents (Profile, Aadhar, PAN) required" });
    }

    // build workerId
    const workerId = generateWorkerId(city, address);

    const worker = await Worker.create({
      name,
      email,
      phone,
      address,
      city,
      workerId,

      // IMAGES SAVED FROM CLOUDINARY
      profilePic: profilePicFile.path,
      profilePic_public_id: profilePicFile.filename,

      aadharPic: aadharPicFile.path,
      aadharPic_public_id: aadharPicFile.filename,

      panPic: panPicFile.path,
      panPic_public_id: panPicFile.filename,
    });

    return res.status(201).json({
      message: "Worker registered successfully",
      worker,
      token: generateToken(worker),
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ========================
// LOGIN WORKER
// ========================
exports.loginWorker = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: "Email or Phone is required" });
    }

    const worker = await Worker.findOne({
      $or: [{ email }, { phone }]
    });

    if (!worker) {
      return res.status(400).json({ message: "Worker not found" });
    }

    return res.status(200).json({
      message: "Login successful",
      worker,
      token: generateToken(worker),
    });

  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ========================
// VIEW PROFILE
// ========================
exports.viewProfile = async (req, res) => {
  try {
    const worker = await Worker.findById(req.worker.id);

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    return res.status(200).json({ worker });

  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ========================     // currently not work -- 
// UPDATE PROFILE
// fields NOT editable: aadharPic, panPic, workerId, profilePic
// ========================
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city } = req.body;

    const worker = await Worker.findById(req.worker.id);
    if (!worker) return res.status(404).json({ message: "Worker not found" });

    // Only updatable fields:
    if (name) worker.name = name;
    if (phone) worker.phone = phone;
    if (address) worker.address = address;
    if (city) worker.city = city;

    // NOTE: Not allowing update for → profilePic, aadharPic, panPic, workerId, verified

    await worker.save();

    return res.status(200).json({
      message: "Profile updated successfully (restricted fields not editable)",
      worker
    });

  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};









// ===========================
// UPDATE WORKER LOCATION
// ===========================
exports.updateWorkerLocation = async (req, res) => {
  try {
    const { workerId } = req.params;     // workerId from URL
    const { lat, lng } = req.body;       // new latitude + longitude

    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and Longitude are required" });
    }

    const worker = await Worker.findOneAndUpdate(
      { workerId },
      { location: [lat, lng] },
      { new: true }
    );

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    res.status(200).json({
      message: "Worker location updated successfully",
      location: worker.location,
    });
  } catch (error) {
    console.log("Location Update Error:", error);
    res.status(500).json({ message: "Server error updating location" });
  }
};

// ===========================
// GET WORKER LOCATION
// ===========================
exports.getWorkerLocation = async (req, res) => {
  try {
    const { workerId } = req.params;

    const worker = await Worker.findOne(
      { workerId },
      { location: 1, name: 1, workerId: 1 } // send limited data
    );

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    res.status(200).json({
      workerId: worker.workerId,
      name: worker.name,
      location: worker.location,
    });
  } catch (error) {
    console.log("Get Location Error:", error);
    res.status(500).json({ message: "Server error fetching location" });
  }
};







const Booking = require("../models/Booking");

/**
 * GET /api/worker/my-bookings
 * Get bookings assigned to logged-in worker
 */
exports.getMyBookings = async (req, res) => {
  try {
    const workerId = req.worker._id; // 🔥 FIX IS HERE

    const bookings = await Booking.find({ worker: workerId })
      .populate("worker", "name workerId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("getMyBookings error:", error);
    res.status(500).json({
      message: "Failed to fetch worker bookings",
    });
  }
};












/**
 * PATCH /api/worker/bookings/:id/start
 * Worker starts assigned task
 */
exports.startWork = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const workerId = req.worker._id; // 🔥 from middleware

    // 1️⃣ Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 2️⃣ Ensure booking is assigned to this worker
    if (!booking.worker || booking.worker.toString() !== workerId.toString()) {
      return res.status(403).json({
        message: "You are not allowed to start this booking",
      });
    }

    // 3️⃣ Prevent invalid status changes
    if (booking.taskStatus === "in-progress") {
      return res.status(400).json({ message: "Work already started" });
    }

    if (booking.taskStatus === "completed") {
      return res.status(400).json({ message: "Task already completed" });
    }

    if (booking.taskStatus === "cancelled") {
      return res.status(400).json({ message: "Task was cancelled" });
    }

    // 4️⃣ Update status
    booking.taskStatus = "in-progress";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Work started",
      booking,
    });
  } catch (error) {
    console.error("startWork error:", error);
    res.status(500).json({
      message: "Failed to start work",
      error: error.message,
    });
  }
};















/**
 * PATCH /api/worker/bookings/:id/rej
 * Worker
 */
exports.rejWork = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const workerId = req.worker._id; // 🔥 from middleware

    // 1️⃣ Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 2️⃣ Ensure booking is assigned to this worker
    if (!booking.worker || booking.worker.toString() !== workerId.toString()) {
      return res.status(403).json({
        message: "You are not allowed to start this booking",
      });
    }

    // 3️⃣ Prevent invalid status changes
    if (booking.taskStatus === "in-progress") {
      return res.status(400).json({ message: "Work already started" });
    }

    if (booking.taskStatus === "completed") {
      return res.status(400).json({ message: "Task already completed" });
    }

    if (booking.taskStatus === "cancelled") {
      return res.status(400).json({ message: "Task was cancelled" });
    }

    // 4️⃣ Update status
    booking.taskStatus = "requested";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Work started",
      booking,
    });
  } catch (error) {
    console.error("startWork error:", error);
    res.status(500).json({
      message: "Failed to start work",
      error: error.message,
    });
  }
};
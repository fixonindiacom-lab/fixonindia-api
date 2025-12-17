const Worker = require("../models/worker");
const Booking = require("../models/Booking");

// ==============================
// VERIFY A WORKER
// ==============================
exports.verifyWorker = async (req, res) => {
  try {
    const { workerId } = req.params;

    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    worker.verified = true;
    await worker.save();

    return res.status(200).json({
      message: "Worker verified successfully",
      worker
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ==============================
// GET ALL WORKERS
// ==============================
exports.getAllWorkers = async (req, res) => {
  try {
    const workers = await Worker.find().sort({ createdAt: -1 });

    return res.status(200).json({
      count: workers.length,
      workers
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==============================
// GET WORKER BY ID
// ==============================
exports.getWorkerById = async (req, res) => {
  try {
    const { workerId } = req.params;

    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    return res.status(200).json({ worker });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};




/**
 * Assign worker to a booking using workerId
 * POST /api/bookings/assign-worker
 */
exports.assignWorkerToBooking = async (req, res) => {
  try {
    const { bookingId, workerId } = req.body;

    if (!bookingId || !workerId) {
      return res.status(400).json({
        success: false,
        message: "bookingId and workerId are required",
      });
    }

    // 1. Find worker by workerId
    const worker = await Worker.findOne({ workerId });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    // 2. Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // 3. Assign worker to booking
    booking.worker = worker._id;
    booking.taskStatus = "accepted";
    booking.wrkr = worker.workerId;

    // Optional: store initial live location from worker
    if (worker.location?.length === 2) {
      booking.workerLiveLocation = {
        type: "Point",
        coordinates: [worker.location[1], worker.location[0]], // lng, lat
        updatedAt: new Date(),
      };
    }

    await booking.save();

    // 4. Update worker stats
    worker.tasksPending += 1;
    await worker.save();

    return res.status(200).json({
      success: true,
      message: "Worker assigned successfully",
      booking,
    });
  } catch (error) {
    console.error("Assign worker error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
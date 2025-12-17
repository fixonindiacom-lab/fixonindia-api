const Booking = require("../models/Booking");

/**
 * CREATE BOOKING
 */
exports.createBooking = async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET ALL BOOKINGS (ADMIN)
 */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("worker", "name phone");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET USER BOOKINGS
 */
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ username: req.params.username });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * WORKER ACCEPT BOOKING
 */
exports.acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        worker: req.body.workerId,
        taskStatus: "accepted",
      },
      { new: true }
    );

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * START TASK
 */
exports.startTask = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { taskStatus: "in-progress" },
      { new: true }
    );
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * COMPLETE TASK
 */
exports.completeTask = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { taskStatus: "completed" },
      { new: true }
    );
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * UPDATE PAYMENT STATUS AFTER RAZORPAY VERIFY
 */
exports.updatePayment = async (req, res) => {
  try {
    const { bookingId, transactionId } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        "payment.status": "success",
        "payment.transactionId": transactionId,
        "payment.method": "online",
      },
      { new: true }
    );

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



/**
 * GET SINGLE BOOKING
 */
exports.getSingleBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      "worker",
      "name phone"
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * UPDATE TASK STATUS (GENERIC)
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { taskStatus: status },
      { new: true }
    );

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * CANCEL BOOKING
 */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { taskStatus: "cancelled" },
      { new: true }
    );

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


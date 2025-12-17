const express = require("express");
const router = express.Router();

const {
  createBooking,
  getAllBookings,
  getUserBookings,
  getSingleBooking,
  updateBookingStatus,
  cancelBooking,
  updatePayment,
} = require("../controllers/bookingController");

// ===============================
// BASIC CRUD
// ===============================

// Create booking
router.post("/", createBooking);

// Get all bookings (admin)
router.get("/", getAllBookings);

// Get single booking by ID
router.get("/:id", getSingleBooking);

// Get bookings by username
router.get("/user/:username", getUserBookings);

// ===============================
// STATUS & ACTIONS
// ===============================

// Update task status (accepted / in-progress / completed)
router.put("/:id/status", updateBookingStatus);

// Cancel booking
router.put("/:id/cancel", cancelBooking);

// ===============================
// PAYMENT
// ===============================

// Update payment after Razorpay verification
router.put("/payment/update", updatePayment);


module.exports = router;

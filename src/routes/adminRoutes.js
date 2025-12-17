const express = require("express");
const router = express.Router();

const {
  verifyWorker,
  unverifyWorker,
  getAllWorkers,
  getWorkerById,
  deleteWorker,
  assignWorkerToBooking,
} = require("../controllers/adminController");

// Admin routes (add admin auth later)

// VERIFY worker
router.put("/verify/:workerId", verifyWorker);

// GET all workers
router.get("/workers", getAllWorkers);

// GET worker by ID
router.get("/workers/:workerId", getWorkerById);


router.put("/assign-worker", assignWorkerToBooking);

module.exports = router;

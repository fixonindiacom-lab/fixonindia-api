const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploads");
const workerAuth = require("../middleware/workerMiddleware"); // <-- new

const {
  registerWorker,
  loginWorker,
  viewProfile,
  updateProfile,
  updateWorkerLocation,
  getWorkerLocation,
  getMyBookings,
  startWork,
  rejWork
} = require("../controllers/workerController");

router.post("/register", upload.any(), registerWorker);
router.post("/login", loginWorker);

// PRIVATE routes
router.get("/profile", workerAuth, viewProfile);
router.put("/profile", workerAuth, updateProfile);





//------------------------------------------

// Update live GPS location  
router.put("/location/update/:workerId", updateWorkerLocation);

// Get current GPS location  
router.get("/location/:workerId", getWorkerLocation);




router.get("/my-bookings",workerAuth, getMyBookings);

router.patch("/bookings/:id/start", workerAuth, startWork);
router.patch("/bookings/:id/rej", workerAuth, rejWork);


module.exports = router;

















// const express = require("express");
// const router = express.Router();
// const auth = require("../middleware/authMiddleware");
// const upload = require("../middleware/uploads");
// const {
//   registerWorker,
//   loginWorker,
//   viewProfile,
//   updateProfile
// } = require("../controllers/workerController");


// router.post(
//   "/register",
//   upload.any(),     // <-- accepts ANY field name
//   registerWorker
// );

// router.post("/login", loginWorker);

// // PRIVATE
// router.get("/profile", auth, viewProfile);
// router.put("/profile", auth, updateProfile);

// module.exports = router;

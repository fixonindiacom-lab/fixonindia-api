const express = require("express");
const router = express.Router();
const {
  addRating,
  getRatings,
  getAverageRating,
} = require("../controllers/ratingController");

// Add a rating
router.post("/add", addRating);

// Get all ratings
router.get("/", getRatings);

// Get average rating
router.get("/average", getAverageRating);

module.exports = router;

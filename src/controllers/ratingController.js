const Rating = require("../models/ratings");

// Add a rating
exports.addRating = async (req, res) => {
  try {
    const { rating, feedback, username } = req.body;

    // If username not provided, generate anonymous username
    const user = username || `Anonymous${Math.floor(Math.random() * 10000)}`;

    const newRating = await Rating.create({
      rating,
      feedback,
      username: user,
    });

    res.status(201).json({ success: true, data: newRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get all ratings
exports.getRatings = async (req, res) => {
  try {
    const ratings = await Rating.find().sort({ date: -1 });
    res.status(200).json({ success: true, data: ratings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get average rating
exports.getAverageRating = async (req, res) => {
  try {
    const result = await Rating.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const averageRating = result[0]?.averageRating || 0;
    const totalRatings = result[0]?.totalRatings || 0;

    res.status(200).json({ success: true, averageRating, totalRatings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

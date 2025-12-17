// middleware/workerMiddleware.js
const jwt = require("jsonwebtoken");
const Worker = require("../models/worker");

const workerAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const worker = await Worker.findById(decoded.id).select("-aadharPic -panPic");

    if (!worker) {
      return res.status(401).json({ message: "Not authorized, worker not found" });
    }

    req.worker = worker; // attach worker to req
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

module.exports = workerAuth;

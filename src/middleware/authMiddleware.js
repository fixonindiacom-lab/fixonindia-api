const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {

    
    // 1️⃣ Read Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
    // 4️⃣ Find user
    const user = await User.findById(decoded.id).select("-password");              
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 5️⃣ Attach user
    req.user = user;
    
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = auth;


























// const jwt = require("jsonwebtoken");
// const User = require("../models/user");

// const auth = async (req, res, next) => {
//   try {
//     // 1. Read token from cookies
//     const token = req.cookies?.token;

//     if (!token) {
//       return res.status(401).json({ message: "Not authenticated. Token missing." });
//     }

//     let decoded;
//     try {
//       // 2. Verify token
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (error) {
//       if (error.name === "TokenExpiredError") {
//         return res.status(401).json({ message: "Token expired. Please login again." });
//       }
//       return res.status(401).json({ message: "Invalid token." });
//     }

//     // 3. Find user from token
//     const user = await User.findById(decoded.id);
//     if (!user) {
//       return res.status(401).json({ message: "User not found." });
//     }

//     // 4. Attach user to request
//     req.user = { id: user._id };

//     // 5. Continue request
//     next();

//   } catch (err) {
//     console.error("Auth Middleware Error:", err);
//     res.status(401).json({ message: "Authentication failed." });
//   }
// };

// module.exports = auth;




















// const jwt = require("jsonwebtoken");
// const User = require("../models/user");

// const auth = async (req, res, next) => {
//   try {
//     // Get token from cookies
//     const token = req.cookies?.token;
//     if (!token) return res.status(401).json({ message: "Not authenticated" });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id);
//     if (!user) return res.status(401).json({ message: "User not found" });

//     req.user = { id: user._id };
//     next();
//   } catch (err) {
//     console.error(err);
//     res.status(401).json({ message: "Authentication failed" });
//   }
// };

// module.exports = auth;

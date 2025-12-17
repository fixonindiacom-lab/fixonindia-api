const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./src/routes/authRoutes");
const workerRoutes = require("./src/routes/workerRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const ratingRoutes = require("./src/routes/ratingRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");

dotenv.config();

const connectDB = require("./src/config/db");
const app = express();


const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// app.use(cors({
//   origin: process.env.FRONTEND_URL || "https://fixonindia.onrender.com",
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
// }));




const allowedOrigins = [
  "http://localhost:5173",
  "https://fixonindia.onrender.com",
  process.env.FRONTEND_URL
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);



// DB connect
connectDB();
// Health route
app.get("/", (req, res) => {
  console.log(process.env.FRONTEND_URL);
  res.send("Backend is working!");
});

// All routes placeholder
app.use("/api/auth", authRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/booking", bookingRoutes);



// ############################
// SOCKET.IO SETUP
// ############################

const server = http.createServer(app);
// STORE ACTIVE WORKERS
let workers = {};

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT" ]
  }
});


//    socket.on("send-location", (data) => {
//     io.emit("receive-location", data);
//    });

//   // Worker LIVE location
//   socket.on("worker-location", (data) => {
//     // data = { workerId, lat, lng }
//     io.emit("update-worker-location", data);
//   });



// SOCKET.IO
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);





  
  socket.on("workerLocationUpdate", async (data) => {
    // data = { bookingId, lat, lng }

    await Booking.findByIdAndUpdate(data.bookingId, {
      workerLiveLocation: {
        type: "Point",
        coordinates: [data.lng, data.lat],
        updatedAt: new Date(),
      },
    });

    socket.broadcast.emit("workerLocationLive", data);
  });







  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});



// ############################
// SERVER LISTENING
// ############################

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log("Server running on port " + PORT));


const razorpay = require("../config/razorpay");
const crypto = require("crypto");

// CREATE PAYMENT ORDER
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body; // INR in rupees

    const options = {
      amount: amount * 100,  // convert to paisa
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// VERIFY PAYMENT
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign === razorpay_signature) {
      return res.status(200).json({ success: true, message: "Payment verified!" });
    } else {
      return res.status(400).json({ success: false, message: "Payment verification failed!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};




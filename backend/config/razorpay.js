const Razorpay = require("razorpay");

// Initialise the Razorpay SDK with backend-only credentials.
// RAZORPAY_KEY_SECRET must NEVER be sent to the frontend.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpay;

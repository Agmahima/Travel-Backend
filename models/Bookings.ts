const mongoose = require('mongoose');
const { baseDbConnection } = require('../dbConnection'); // Adjust the path as necessary
const itineraryDaySchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingReference: String,
  totalAmount: Number,
  currency: String,
  paymentStatus: { type: String, default: 'pending' },
  bookingDate: { type: Date, default: Date.now },
  createdAt:{ type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });
// module.exports = baseDbConnection.model('Booking', itineraryDaySchema); // Ensure 'Booking' is exactly as used
const Booking = baseDbConnection.model('Booking', itineraryDaySchema);
export default Booking; // ✅ Use default export
import mongoose from 'mongoose';
const { baseDbConnection } = require('../dbConnection'); // Adjust the path as necessary

const transportationBookingSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverName: { type: String },
  vehicleType: { type: String, required: true },
  serviceLevel: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, default: 'booked' },
  price: { type: Number, required: true },
}, { timestamps: true });

// module.exports = baseDbConnection.model('TransportationBooking', transportationBookingSchema); // Ensure 'TransportationBooking' is exactly as used
const TransportationBooking  = baseDbConnection.model('TransportationBooking', transportationBookingSchema);
export default TransportationBooking; // ✅ Use default export
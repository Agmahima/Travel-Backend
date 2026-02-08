import mongoose from 'mongoose';
const { baseDbConnection } = require('../dbConnection'); // Adjust the path as necessary

const transportationBookingSchema = new mongoose.Schema({
 tripId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Trip', 
    required: false  // ✅ Make optional for standalone bookings
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  pickupLocation: { type: String, required: true },
  dropLocation: { type: String, required: true },

  driverName: { type: String },
  vehicleType: { type: String, required: true },
  serviceLevel: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, default: 'booked' },
  price: { type: Number, required: true },
  // ✅ Add booking type to differentiate
  bookingType: { 
    type: String, 
    enum: ['trip-based', 'standalone'], 
    default: 'trip-based' 
  }
}, { timestamps: true });

// module.exports = baseDbConnection.model('TransportationBooking', transportationBookingSchema); // Ensure 'TransportationBooking' is exactly as used
const TransportationBooking  = baseDbConnection.model('TransportationBooking', transportationBookingSchema);
export default TransportationBooking; // ✅ Use default export
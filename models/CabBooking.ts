const mongoose = require('mongoose');
const { baseDbConnection } = require('../dbConnection'); // Adjust the path as necessary
const CabBookingSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    cabBookingRef: String,
    serviceProvider: String,
    cabType: String,
    pickupLocation: String,
    dropLocation: String,
    pickupTime: Date,
    duration: Number,
    price: Number,
    status: String,
});
// module.exports = baseDbConnection.model('CabBooking', CabBookingSchema); // Ensure 'CabBooking' is exactly as used
const CabBooking = baseDbConnection.model('CabBooking', CabBookingSchema);
export default CabBooking; // ✅ Use default export
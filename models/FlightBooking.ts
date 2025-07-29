const mongoose = require('mongoose');
const { baseDbConnection } = require('../dbConnection'); // Adjust the path as necessary
const FlightBookingSchema = new mongoose.Schema({
    bookingId: {type:mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true},
    flightBookingRef:String,
    airline:String,
    flightNumber:String,
    departure:String,
    arrival:String,
    departureTime: Date,
    arrivalTime: Date,
    passengerDetails: Object,
    price: Number,
    status: String,
});

// module.exports = baseDbConnection.model('FlightBooking', FlightBookingSchema); // Ensure 'FlightBooking' is exactly as used
const FlightBooking = baseDbConnection.model('FlightBooking', FlightBookingSchema);
export default FlightBooking; // ✅ Use default export
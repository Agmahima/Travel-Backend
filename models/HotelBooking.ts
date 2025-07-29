const mongoose = require('mongoose');
const { baseDbConnection } = require('../dbConnection'); // Adjust the path as necessary
const HotelBookingSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    hotelBookingRef: String,
    hotelName: String,
    hotelAddress: String,
    checkIn: Date,
    checkOut: Date,
    rooms: Number,
    guests: Number,
    roomType: String,
    pricePerNight: Number,
    totalPrice: Number,
    status: String,
});
// module.exports = baseDbConnection.model('HotelBooking', HotelBookingSchema); // Ensure 'HotelBooking' is exactly as used
const HotelBooking = baseDbConnection.model('HotelBooking', HotelBookingSchema);
export default HotelBooking; // ✅ Use default export
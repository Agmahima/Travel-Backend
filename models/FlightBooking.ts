const mongoose = require('mongoose');
const { baseDbConnection } = require('../dbConnection'); // Adjust the path as necessary
const FlightBookingSchema = new mongoose.Schema({
    bookingId: {type:mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true},
    flightBookingRef:{type:String, required:true},

    flightdetails: {
        airline:String,
        flightNumber:String,
        departure: {
            airport:String,
            city: String,
            dateTime:Date,
            terminal:String
        },
        arrival:{
            airport:String,
            city:String,
            dateTime:Date,
            terminal:String
        },
        aircraft:String,
        duration:Number,
        class:{type:String, enum: ['economy', 'preminum_economy','business','first']}
    },

    passengers: [{
        travelerId :{type: mongoose.Schema.Types.ObjectId, ref: 'Traveler', required: true},
        seatNumber:String,
        mealPreference:String,
        baggageDetails:{
            checkedBags: Number,
            carryOnBags:Number,
            weight:Number
        },
        specialServices: [String],
        ticketNumber:String
    }],

    pricing: {
        basePrice: Number,
        taxes:Number,
        fees: Number,
        totalPrice:Number,
        currency: {type:String, default:'INR'}
    },

    status: {
        type: String,
        enum: ['pending','confirmed','cancelled','completed','draft'],
        default:'draft'
    },
    pnr:String,
    gdsRef: String,
    ticketingDeadline: Date,

    
    
},{timestamps:true});

// module.exports = baseDbConnection.model('FlightBooking', FlightBookingSchema); // Ensure 'FlightBooking' is exactly as used
const FlightBooking = baseDbConnection.model('FlightBooking', FlightBookingSchema);
export default FlightBooking; // ✅ Use default export
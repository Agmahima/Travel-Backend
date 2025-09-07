import { timestamp } from "drizzle-orm/gel-core";

const mongoose = require('mongoose');
const { baseDbConnection } = require('../dbConnection'); // Adjust the path as necessary


const HotelBookingSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    hotelBookingRef: {type: String, required:true, unique:true},

    hotelDetails: {
    hotelId: String,
    hotelName: { type: String, required: true },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    starRating: Number,
    propertyType: String
  },
  
  // Stay Details
  stayDetails: {
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true },
    rooms: [{
      roomType: String,
      roomDescription: String,
      bedType: String,
      roomSize: String,
      amenities: [String],
      occupancy: {
        adults: { type: Number, required: true, min: 1 },
        children: { type: Number, default: 0, min: 0 }
      },
      // Travelers assigned to this room
      assignedTravelers: [{
        travelerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Traveler', required: true },
        isPrimary: { type: Boolean, default: false } // Primary guest for the room
      }]
    }]
  },
  
  // Guest Details (lead guest for check-in)
  leadGuest: {
    travelerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Traveler', required: true }
  },
  
  pricing: {
    basePrice: Number,
    taxes: Number,
    fees: Number,
    totalPrice: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    priceBreakdown: [{
      date: Date,
      roomRate: Number,
      taxes: Number
    }]
  },
  
  // Policies
  policies: {
    cancellation: String,
    payment: String,
    checkIn: String,
    checkOut: String
  },
  
  // Special requests and services
  specialRequests: String,
  additionalServices: [{
    serviceType: String,
    description: String,
    price: Number,
    currency: String
  }],
  
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  
  // Confirmation details
  confirmationNumber: String,
  voucherNumber: String,
    

    
},{timestamps:true});
// module.exports = baseDbConnection.model('HotelBooking', HotelBookingSchema); // Ensure 'HotelBooking' is exactly as used
const HotelBooking = baseDbConnection.model('HotelBooking', HotelBookingSchema);
export default HotelBooking; // ✅ Use default export
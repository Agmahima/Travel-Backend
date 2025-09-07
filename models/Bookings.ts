
const mongoose = require('mongoose');
const { baseDbConnection } = require('../dbConnection'); // Adjust the path as necessary
const bookingSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingReference: {type: String, required: true, unique: true},
  

  travelers: [{ 
    travelerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Traveller', required: true },
    isLeadTraveler: { type: Boolean, default: false }
  }],

  services: {
    flights: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FlightBooking' }],
    hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HotelBooking' }],
    cabs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CabBooking' }],
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ActivityBooking' }]
  },

   pricing: {
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    breakdown: {
      flights: Number,
      hotels: Number,
      cabs: Number,
      activities: Number,
      taxes: Number,
      fees: Number,
      discounts: Number
    }
  },

  paymentSummary: {
    totalPaid: { type: Number, default: 0 },
    totalRefunded: { type: Number, default: 0 },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'partial', 'paid', 'refunded'], 
      default: 'pending' 
    }
  },
  
  status : {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'draft'
  },

  // paymentStatus: { type: String, default: 'pending' },
  bookingDate: { type: Date, default: Date.now },

  bookingChannel: { type: String, enum: ['web', 'mobile', 'api'], default: 'web' },
  specialRequests: String,
  
}, { timestamps: true });

bookingSchema.index({ userId: 1, tripId: 1 });
bookingSchema.index({ bookingReference: 1});
bookingSchema.index({status:1});


const Booking = baseDbConnection.model('Booking', bookingSchema);
export default Booking; // ✅ Use default export
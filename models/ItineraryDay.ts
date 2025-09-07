import { StringChunk } from 'drizzle-orm';
import { unique } from 'drizzle-orm/gel-core';
import mongoose from 'mongoose';
const { baseDbConnection } = require('../dbConnection'); // Adjust the path as necessary

const daySchema= new mongoose.Schema({
    dayNumber: {
        type :Number,
        required:true,
    },
    date: {
        type:Date,
        required:true,
    },
    location:String,
    activities: [{
        title:String,
        description:String,
        time:String,
        duration:String,
        location:String,
        cost:String,
        category:String
    }],
    accommodation: String,
    transportation:String,
    meals: {
        breakfast: String,
        lunch:String,
        dinner :String
    },
    estimatedCost: Number
}, {_id: false });

const itineraryDaySchema = new mongoose.Schema({
  itineraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip', // Reference to the main trip
    required: true,
    unique: true // Ensure only one itinerary document per trip
  },
  destination: String, // Main destination name
  totalDays: Number, // Total number of days
  days: [daySchema] // Array of days
}, {
  timestamps: true
});

// Create index on itineraryId for better performance
itineraryDaySchema.index({ itineraryId: 1 });

const ItineraryDay = baseDbConnection.model('ItineraryDay', itineraryDaySchema);
export default ItineraryDay; // ✅ Use default export
const mongoose = require('mongoose');
const { baseDbConnection } = require('../dbConnection'); // Adjust the path as necessary
const itineraryDaySchema = new mongoose.Schema({
  itineraryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Trip', // Reference to the main trip
    required: true 
  },
  dayNumber: { 
    type: Number, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  location: String,
  activities: [{
    title: String,
    description: String,
    time: String,
    duration: String,
    location: String,
    cost: String,
    category: String
  }],
  accommodation: String,
  transportation: String,
  meals: {
    breakfast: String,
    lunch: String,
    dinner: String
  },
  estimatedCost: Number
}, {
  timestamps: true
});

const ItineraryDay = baseDbConnection.model('ItineraryDay', itineraryDaySchema);
module.exports = ItineraryDay;
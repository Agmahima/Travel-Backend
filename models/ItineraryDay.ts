const mongoose = require('mongoose');
const { baseDbConnection } = require('../dbConnection'); // Adjust the path as necessary
const itineraryDaySchema = new mongoose.Schema({
    itineraryId : { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary',required:true },
    dayNumber:Number,
    date: Date,
    location: String,
    activities: [String],
    accommodation: String,
    transportation: String,
    meals: {
        breakfast: String,
        lunch: String,
        dinner: String
    },
    estimatedCost: Number
});

// module.exports = baseDbConnection.model('ItineraryDay', itineraryDaySchema); // Ensure 'ItineraryDay' is exactly as used
const ItineraryDay = baseDbConnection.model('ItineraryDay', itineraryDaySchema);
export default ItineraryDay; // ✅ Use default export
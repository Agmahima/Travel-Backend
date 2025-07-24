import mongoose from 'mongoose';
const {baseDbConnection} = require('../dbConnection'); // Adjust the path as necessary
const tripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  adults: { type: Number, required: true },
  children: { type: Number, default: 0 },
  itinerary: { type: mongoose.Schema.Types.Mixed },
  preferences: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, default: 'planned' },
}, { timestamps: true });

// module.exports = baseDbConnection.model('Trip', tripSchema); // Ensure 'Trip' is exactly as used
const Trip = baseDbConnection.model('Trip', tripSchema);
export default Trip; // ✅ Use default export



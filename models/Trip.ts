// import mongoose from 'mongoose';
// const {baseDbConnection} = require('../dbConnection'); // Adjust the path as necessary
// const tripSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   destinations: [{ city: String, days: Number }],
//   startDate: { type: Date, required: true },
//   endDate: { type: Date, required: true },
//   adults: { type: Number, required: true },
//   children: { type: Number, default: 0 },
//   itineraryData: Object,
//   preferences: { type: mongoose.Schema.Types.Mixed },
//   status: { type: String, default: 'planned' },
// }, { timestamps: true });

// // module.exports = baseDbConnection.model('Trip', tripSchema); // Ensure 'Trip' is exactly as used
// const Trip = baseDbConnection.model('Trip', tripSchema);
// export default Trip; // ✅ Use default export


import mongoose from 'mongoose';
const {baseDbConnection} = require('../dbConnection'); // Adjust the path as necessary

const tripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // OLD: destinations: [{ city: String, days: Number }],
  // NEW: Update field names to match frontend expectations
  destinations: [{ 
    location: { type: String, required: true }, 
    daysToStay: { type: Number, required: true, default: 1 }
  }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  adults: { type: Number, required: true },
  children: { type: Number, default: 0 },
  // Also add transportationOptions field for consistency
  transportationOptions: [{
    fromDestination: Number,
    toDestination: Number,
    mode: { type: String, enum: ['train', 'bus', 'car', 'flight'] },
    booked: { type: Boolean, default: false }
  }],
  itineraryData: Object,
  preferences: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, default: 'planned' },
}, { timestamps: true });

const Trip = baseDbConnection.model('Trip', tripSchema);
export default Trip;
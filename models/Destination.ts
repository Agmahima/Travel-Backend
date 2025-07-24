import mongoose from 'mongoose';
const { baseDbConnection } = require('../dbConnection'); // Adjust the path as necessary
const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  rating: { type: String },
  pricePerPerson: { type: Number },
  badge: { type: String },
}, { timestamps: true });

// module.exports = baseDbConnection.model('Destination', destinationSchema); // Ensure 'Destination' is exactly as used
// const Destination = mongoose.model('Destination', destinationSchema);
// export default Destination;
const Destination = baseDbConnection.model('Destination', destinationSchema);
export default Destination; // ✅ Use default export
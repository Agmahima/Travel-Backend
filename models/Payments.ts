const mongoose = require('mongoose');
const { baseDbConnection } = require('../dbConnection'); // Adjust the path as necessary
const PaymentSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    paymentId: String,
    paymentGateway: String,
    paymentMethod: String,
    amount: Number,
    currency: String,
    status: { type: String, default: 'pending' },
    paymentDate: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    paymentDetails:Object // This can be used to store additional payment details if needed
}, { timestamps: true });

// module.exports = baseDbConnection.model('Payment', PaymentSchema); // Ensure 'Payment' is exactly as used
const Payment = baseDbConnection.model('Payment', PaymentSchema);
export default Payment; // ✅ Use default export
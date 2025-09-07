// const mongoose = require('mongoose');
// const { baseDbConnection } = require('../dbConnection'); // Adjust the path as necessary
// const PaymentSchema = new mongoose.Schema({
//     bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bookings', required: true },
//     paymentId: String,
//     paymentGateway: String,
//     paymentMethod: String,
//     amount: Number,
//     currency: String,
//     status: { type: String, default: 'pending' },
//     paymentDate: { type: Date, default: Date.now },
//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date, default: Date.now },
//     paymentDetails:Object // This can be used to store additional payment details if needed
// }, { timestamps: true });

// // module.exports = baseDbConnection.model('Payment', PaymentSchema); // Ensure 'Payment' is exactly as used
// const Payment = baseDbConnection.model('Payment', PaymentSchema);
// export default Payment; // ✅ Use default export

const mongoose = require('mongoose');
const { baseDbConnection } = require('../dbConnection');

const PaymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ✅ who paid
  paymentType: { 
    type: String, 
    enum: ['booking', 'partial', 'additional', 'refund'], 
    default: 'booking' 
  },

   serviceAllocation: [{
    serviceType: { type: String, enum: ['flight', 'hotel', 'cab', 'activity', 'fees', 'taxes'] },
    serviceId: mongoose.Schema.Types.ObjectId, // Reference to specific service booking
    allocatedAmount: Number,
    currency: { type: String, default: 'INR' }
  }],
  

  transactionRef: { type: String, required: true }, // e.g. Razorpay/Stripe ID
  paymentGateway: { type: String, required: true }, // e.g. Razorpay, Stripe, PayPal
  paymentMethod: { type: String }, // e.g. UPI, Card, Netbanking

  
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },

  status: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending' 
  },


  initiatedAt : { type: Date, default: Date.now },
  completedAt : Date,

  gatewayResponse : {
    raw: Object,
    receiptUrl: String,
    failureReason : String
  },

  refundDetails: {
    refundId: String,
    refundAmount: Number,
    refundreason: String,
    refundDate: Date,
    refundStatus: String
  },

  processedBy: String,
  notes: String,

}, { timestamps: true });

PaymentSchema.index({bookingId:1});
PaymentSchema.index({userId:1});
PaymentSchema.index({transactionRef: 1});
PaymentSchema.index({status:1});

const Payment = baseDbConnection.model('Payment', PaymentSchema);
export default Payment;

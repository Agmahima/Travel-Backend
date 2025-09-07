const mongoose = require('mongoose');
const {baseDbConnection} = require('../dbConnection'); // Adjust the path as necessary

const TravelerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    profileType: {type:String, enum:['self','family','colleague','other'],default:'self'},

    personalInfo: {
        firstName: {type:String,required:true},
        lastName: {type:String, required: true},
        middleName: String,
        title :{type: String, enum :['Mr', 'Ms','Mrs', 'Dr']},
        dateOfBirth: Date,
        gender: {type: String, enum: ['M','F','O']},
        nationality: String
    },

    contactInfo:{
        email:{type:String, required:true},
        phone:String,
        alternatePhone: String,
        address:{
            street: String,
            city: String,
            state: String,
            country: String,
            zipCode: String
        }
    },

    documents: [{
        type: {type:String, enum:['passport','visa','driving_license','nationsl_id']},
        number: String,
        issuingCountry: String,
        issueDate: Date,
        expiryDate: Date,
        isActive: {type:Boolean, default: true}
    }],

    preferences: {
    dietaryRestrictions: [String],
    seatPreference: String,
    mealPreference: String,
    specialAssistance: [String],
    frequentFlyerNumbers: [{
      airline: String,
      membershipNumber: String
    }],
    hotelPreferences: {
      roomType: String,
      bedType: String,
      smoking: { type: Boolean, default: false },
      floor: String
    }
  },
  
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

TravelerSchema.index({ userId: 1 });
TravelerSchema.index({ 'contactInfo.email': 1 });
const Traveler = baseDbConnection.model('Traveler', TravelerSchema);


export default Traveler; 
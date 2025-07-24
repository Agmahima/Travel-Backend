import mongoose from 'mongoose';
const { baseDbConnection } = require('../dbConnection'); 
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
}, { timestamps: true });

// module.exports= baseDbConnection.model('User', userSchema); // Ensure 'User' is exactly as used
const User = baseDbConnection.model('User', userSchema);
export default User; // ✅ Use default export
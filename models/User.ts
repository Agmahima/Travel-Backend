import mongoose from 'mongoose';
import bcrypt from "bcrypt";

const { baseDbConnection } = require('../dbConnection'); 
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// module.exports= baseDbConnection.model('User', userSchema); // Ensure 'User' is exactly as used
const User = baseDbConnection.model('User', userSchema);
export default User; // ✅ Use default export
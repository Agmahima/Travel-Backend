const mongoose = require('mongoose');
const { baseDbConnection } = require('../dbConnection'); // Adjust the path as necessary
const SavedSearchSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    searchType:String,
    searchParams: Object,
    searchName: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });
// module.exports = baseDbConnection.model('SavedSearch', SavedSearchSchema); // Ensure 'SavedSearch' is exactly as used
const SavedSearch = baseDbConnection.model('SavedSearch', SavedSearchSchema);
export default SavedSearch; // ✅ Use default export
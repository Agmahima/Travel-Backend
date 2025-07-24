const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const baseDbUri=process.env.DB_URI || 'mongodb://localhost:27017/mydatabase';


// const baseDbConnection = mongoose.createConnection(baseDbUri);

console.log("Connecting to Mongo URI:", baseDbUri);

const baseDbConnection = mongoose.createConnection(baseDbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true // add this if you're using Atlas SRV URI
});

module.exports = {baseDbConnection};
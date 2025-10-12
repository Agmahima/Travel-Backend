import mongoose, { Schema, Document } from 'mongoose';
const { baseDbConnection } = require('../dbConnection'); 

interface IFlightSearchResult extends Document {
  userId: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  searchParams: {
    originCode: string;
    destinationCode: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    children: number;
  };
  flightData: any; // Store the Amadeus flight offer
  searchSessionId: string; // To group search results
  expiresAt: Date;
}

const FlightSearchResultSchema = new Schema<IFlightSearchResult>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
  searchParams: {
    originCode: String,
    destinationCode: String,
    departureDate: String,
    returnDate: String,
    adults: Number,
    children: Number
  },
  flightData: Schema.Types.Mixed,
  searchSessionId: String,
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }
}, { timestamps: true });

FlightSearchResultSchema.index({ userId: 1, tripId: 1 });
FlightSearchResultSchema.index({ searchSessionId: 1 });
FlightSearchResultSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// export const FlightSearchResult = mongoose.model<IFlightSearchResult>('FlightSearchResult', FlightSearchResultSchema);
const FlightSearchResult = baseDbConnection.model('FlightSearchResult', FlightSearchResultSchema);
export default FlightSearchResult;
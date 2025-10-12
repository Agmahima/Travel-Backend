// src/models/HotelSearchResult.ts
import mongoose, { Schema, Document } from 'mongoose';
const { baseDbConnection } = require('../dbConnection'); 

interface IHotelSearchResult extends Document {
  userId: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  searchParams: {
    destId: string;
    checkinDate: string;
    checkoutDate: string;
    adults: number;
    children: number;
    rooms: number;
  };
  hotelData: any;
  searchSessionId: string;
  expiresAt: Date;
}

const HotelSearchResultSchema = new Schema<IHotelSearchResult>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
  searchParams: {
    destId: String,
    checkinDate: String,
    checkoutDate: String,
    adults: Number,
    children: Number,
    rooms: Number
  },
  hotelData: Schema.Types.Mixed,
  searchSessionId: String,
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }
}, { timestamps: true });

HotelSearchResultSchema.index({ userId: 1, tripId: 1 });
HotelSearchResultSchema.index({ searchSessionId: 1 });
HotelSearchResultSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// export const HotelSearchResult = mongoose.model<IHotelSearchResult>('HotelSearchResult', HotelSearchResultSchema);
const HotelSearchResult = baseDbConnection.model('HotelSearchResult', HotelSearchResultSchema);
export default HotelSearchResult;
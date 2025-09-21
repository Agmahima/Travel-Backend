// import { timestamp } from "drizzle-orm/gel-core";

// const mongoose = require('mongoose');
// const { baseDbConnection } = require('../dbConnection'); // Adjust the path as necessary


// const HotelBookingSchema = new mongoose.Schema({
//     bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
//     hotelBookingRef: {type: String, required:true, unique:true},

//     hotelDetails: {
//     hotelId: String,
//     hotelName: { type: String, required: true },
//     address: {
//       street: String,
//       city: String,
//       state: String,
//       country: String,
//       zipCode: String
//     },
//     starRating: Number,
//     propertyType: String
//   },
  
//   // Stay Details
//   stayDetails: {
//     checkIn: { type: Date, required: true },
//     checkOut: { type: Date, required: true },
//     nights: { type: Number, required: true },
//     rooms: [{
//       roomType: String,
//       roomDescription: String,
//       bedType: String,
//       roomSize: String,
//       amenities: [String],
//       occupancy: {
//         adults: { type: Number, required: true, min: 1 },
//         children: { type: Number, default: 0, min: 0 }
//       },
//       // Travelers assigned to this room
//       assignedTravelers: [{
//         travelerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Traveler', required: true },
//         isPrimary: { type: Boolean, default: false } // Primary guest for the room
//       }]
//     }]
//   },
  
//   // Guest Details (lead guest for check-in)
//   leadGuest: {
//     travelerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Traveler', required: true }
//   },
  
//   pricing: {
//     basePrice: Number,
//     taxes: Number,
//     fees: Number,
//     totalPrice: { type: Number, required: true },
//     currency: { type: String, default: 'INR' },
//     priceBreakdown: [{
//       date: Date,
//       roomRate: Number,
//       taxes: Number
//     }]
//   },
  
//   // Policies
//   policies: {
//     cancellation: String,
//     payment: String,
//     checkIn: String,
//     checkOut: String
//   },
  
//   // Special requests and services
//   specialRequests: String,
//   additionalServices: [{
//     serviceType: String,
//     description: String,
//     price: Number,
//     currency: String
//   }],
  
//   status: {
//     type: String,
//     enum: ['pending', 'confirmed', 'cancelled', 'completed'],
//     default: 'pending'
//   },
  
//   // Confirmation details
//   confirmationNumber: String,
//   voucherNumber: String,
    

    
// },{timestamps:true});
// // module.exports = baseDbConnection.model('HotelBooking', HotelBookingSchema); // Ensure 'HotelBooking' is exactly as used
// const HotelBooking = baseDbConnection.model('HotelBooking', HotelBookingSchema);
// export default HotelBooking; // ✅ Use default export

// models/HotelBooking.js - Improved Schema
import mongoose, { Document, Schema, Model } from 'mongoose';
const { baseDbConnection } = require('../dbConnection');

// Interface for the document
interface IHotelBooking extends Document {
  bookingId: mongoose.Types.ObjectId;
  hotelBookingRef: string;
  apiDetails: {
    hotelId: string;
    blockId?: string;
    destId?: string;
    searchType?: string;
    bookingSource: string;
  };
  hotelDetails: {
    hotelId: string;
    hotelName: string;
    hotelNameTranslated?: string;
    url?: string;
    address: {
      street?: string;
      city: string;
      district?: string;
      state?: string;
      country: string;
      countryCode?: string;
      zipCode?: string;
      addressTranslated?: string;
    };
    coordinates: {
      latitude: number;
      longitude: number;
      distanceToCenter?: number;
    };
    starRating?: number;
    propertyType?: string;
    accommodationType?: string;
    reviews?: {
      score?: number;
      count?: number;
      scoreWord?: string;
    };
    facilities?: Array<{
      name?: string;
      icon?: string;
      category?: string;
    }>;
    images?: Array<{
      url?: string;
      description?: string;
      type?: string;
    }>;
  };
  stayDetails: {
    checkIn: Date;
    checkOut: Date;
    nights: number;
    searchParams: {
      adults: number;
      children: number;
      childrenAges?: number[];
      roomQuantity: number;
    };
    rooms: Array<{
      roomId?: string;
      blockId?: string;
      roomType?: string;
      roomName?: string;
      roomDescription?: string;
      bedConfiguration?: Array<{
        bedType?: string;
        bedTypeId?: number;
        count?: number;
        description?: string;
        width?: string;
      }>;
      roomSize?: {
        squareMeters?: number;
        squareFeet?: number;
      };
      amenities?: string[];
      facilities?: Array<{
        id?: number;
        name?: string;
        category?: string;
      }>;
      occupancy: {
        adults: number;
        children: number;
        maxOccupancy?: number;
      };
      roomPricing?: {
        basePrice?: number;
        totalPrice?: number;
        currency?: string;
        pricePerNight?: number;
        taxes?: number;
        fees?: number;
      };
      assignedTravelers?: Array<{
        travelerId: mongoose.Types.ObjectId;
        isPrimary: boolean;
        guestType: 'adult' | 'child';
      }>;
      mealPlan?: {
        included?: string;
        options?: string[];
      };
      roomPolicies?: {
        smoking: boolean;
        petsAllowed: boolean;
      };
    }>;
  };
  leadGuest: {
    travelerId: mongoose.Types.ObjectId;
    isPrimaryBooker: boolean;
  };
  pricing: {
    basePrice: number;
    taxes: number;
    fees: number;
    totalPrice: number;
    currency: string;
    currencySymbol?: string;
    exchangeRate?: {
      fromCurrency?: string;
      toCurrency?: string;
      rate?: number;
      timestamp?: Date;
    };
    priceBreakdown?: Array<{
      date?: Date;
      roomRate?: number;
      taxes?: number;
      fees?: number;
      totalDayPrice?: number;
    }>;
    charges?: Array<{
      type?: string;
      name?: string;
      amount?: number;
      currency?: string;
      inclusionType?: 'included' | 'excluded';
    }>;
    discounts?: Array<{
      type?: string;
      name?: string;
      amount?: number;
      percentage?: number;
    }>;
  };
  policies: {
    cancellation?: {
      type?: string;
      deadline?: Date;
      penalty?: number;
      isRefundable?: boolean;
      description?: string;
    };
    payment?: {
      type?: string;
      prepaymentRequired?: boolean;
      prepaymentAmount?: number;
      acceptedCards?: string[];
      description?: string;
    };
    checkIn?: {
      time?: string;
      instructions?: string;
      requirements?: string[];
    };
    checkOut?: {
      time?: string;
      instructions?: string;
    };
    childrenPolicy?: {
      allowChildren?: boolean;
      freeAge?: number;
      adultAge?: number;
      infantAge?: number;
    };
    petPolicy?: {
      petsAllowed?: boolean;
      petFee?: number;
      restrictions?: string;
    };
  };
  services?: {
    specialRequests?: string;
    additionalServices?: Array<{
      serviceType?: string;
      name?: string;
      description?: string;
      price?: number;
      currency?: string;
      isSelected?: boolean;
      isRequired?: boolean;
    }>;
    transfers?: {
      airportPickup?: boolean;
      airportDrop?: boolean;
      cost?: number;
    };
    mealPreferences?: {
      breakfast?: boolean;
      dietary?: string[];
    };
  };
  status: 'draft' | 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show' | 'completed';
  confirmation?: {
    confirmationNumber?: string;
    voucherNumber?: string;
    supplierReference?: string;
    hotelReference?: string;
    confirmedAt?: Date;
    confirmationEmail?: string;
    checkedInAt?: Date;
    checkedOutAt?: Date;
    actualCheckOut?: Date;
  };
  communications?: Array<{
    type: 'email' | 'sms' | 'push' | 'system';
    recipient?: string;
    subject?: string;
    message?: string;
    sentAt?: Date;
    status: 'pending' | 'sent' | 'delivered' | 'failed';
  }>;
  modifications?: Array<{
    modifiedAt: Date;
    modifiedBy?: string;
    modificationType?: string;
    oldValue?: any;
    newValue?: any;
    reason?: string;
  }>;
  syncStatus?: {
    lastSyncAt?: Date;
    syncErrors?: string[];
    needsSync: boolean;
  };
  metadata?: {
    source: string;
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
    bookingFlow?: string;
    deviceType?: string;
    referrer?: string;
  };

  // Instance methods
  isModifiable(): boolean;
  isCancellable(): boolean;
}

const HotelBookingSchema = new Schema<IHotelBooking>({
  // Unique booking reference
  bookingId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true,
    index: true
  },
  
  hotelBookingRef: {
    type: String, 
    required: true, 
    unique: true,
    index: true
  },

  // API Integration fields
  apiDetails: {
    hotelId: { type: String, required: true, index: true },
    blockId: String, // Room block ID from booking.com
    destId: String, // Destination ID
    searchType: String,
    bookingSource: { type: String, default: 'booking.com' }
  },

  // Hotel information
  hotelDetails: {
    hotelId: { type: String, required: true },
    hotelName: { type: String, required: true },
    hotelNameTranslated: String,
    url: String, // Direct booking URL
    
    address: {
      street: String,
      city: { type: String, required: true },
      district: String,
      state: String,
      country: { type: String, required: true },
      countryCode: String,
      zipCode: String,
      addressTranslated: String
    },
    
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      distanceToCenter: Number // Distance to city center
    },
    
    starRating: { type: Number, min: 0, max: 5 },
    propertyType: String,
    accommodationType: String,
    
    reviews: {
      score: Number,
      count: Number,
      scoreWord: String
    },

    facilities: [{
      name: String,
      icon: String,
      category: String
    }],

    images: [{
      url: String,
      description: String,
      type: String // main, room, facility, etc.
    }]
  },

  // Stay details
  stayDetails: {
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true, min: 1 },
    
    searchParams: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0, min: 0 },
      childrenAges: [Number],
      roomQuantity: { type: Number, required: true, min: 1 }
    },

    rooms: [{
      roomId: String,
      blockId: String,
      roomType: String,
      roomName: String,
      roomDescription: String,
      
      bedConfiguration: [{
        bedType: String,
        bedTypeId: Number,
        count: Number,
        description: String,
        width: String
      }],
      
      roomSize: {
        squareMeters: Number,
        squareFeet: Number
      },
      
      amenities: [String],
      facilities: [{
        id: Number,
        name: String,
        category: String
      }],
      
      occupancy: {
        adults: { type: Number, required: true, min: 1 },
        children: { type: Number, default: 0, min: 0 },
        maxOccupancy: Number
      },
      
      // Room-specific pricing
      roomPricing: {
        basePrice: Number,
        totalPrice: Number,
        currency: String,
        pricePerNight: Number,
        taxes: Number,
        fees: Number
      },

      // Travelers assigned to this room
      assignedTravelers: [{
        travelerId: { 
          type: Schema.Types.ObjectId, 
          ref: 'Traveler', 
          required: true 
        },
        isPrimary: { type: Boolean, default: false },
        guestType: { type: String, enum: ['adult', 'child'], default: 'adult' }
      }],

      // Room policies
      mealPlan: {
        included: String,
        options: [String]
      },
      
      roomPolicies: {
        smoking: { type: Boolean, default: false },
        petsAllowed: { type: Boolean, default: false }
      }
    }]
  },

  // Lead guest information
  leadGuest: {
    travelerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Traveler', 
      required: true 
    },
    isPrimaryBooker: { type: Boolean, default: true }
  },

  // Comprehensive pricing
  pricing: {
    basePrice: { type: Number, required: true },
    taxes: { type: Number, default: 0 },
    fees: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    currencySymbol: String,
    
    // Exchange rate info if different currency
    exchangeRate: {
      fromCurrency: String,
      toCurrency: String,
      rate: Number,
      timestamp: Date
    },
    
    priceBreakdown: [{
      date: Date,
      roomRate: Number,
      taxes: Number,
      fees: Number,
      totalDayPrice: Number
    }],
    
    // Additional charges breakdown
    charges: [{
      type: String, // tax, fee, service_charge, etc.
      name: String,
      amount: Number,
      currency: String,
      inclusionType: { type: String, enum: ['included', 'excluded'] }
    }],

    // Discount information
    discounts: [{
      type: String, // genius, early_bird, last_minute, etc.
      name: String,
      amount: Number,
      percentage: Number
    }]
  },

  // Booking policies
  policies: {
    cancellation: {
      type: String,
      deadline: Date,
      penalty: Number,
      isRefundable: Boolean,
      description: String
    },
    
    payment: {
      type: String,
      prepaymentRequired: Boolean,
      prepaymentAmount: Number,
      acceptedCards: [String],
      description: String
    },
    
    checkIn: {
      time: String,
      instructions: String,
      requirements: [String] // ID, credit card, etc.
    },
    
    checkOut: {
      time: String,
      instructions: String
    },
    
    childrenPolicy: {
      allowChildren: Boolean,
      freeAge: Number,
      adultAge: Number,
      infantAge: Number
    },

    petPolicy: {
      petsAllowed: Boolean,
      petFee: Number,
      restrictions: String
    }
  },

  // Guest services and requests
  services: {
    specialRequests: String,
    
    additionalServices: [{
      serviceType: String,
      name: String,
      description: String,
      price: Number,
      currency: String,
      isSelected: Boolean,
      isRequired: Boolean
    }],
    
    transfers: {
      airportPickup: Boolean,
      airportDrop: Boolean,
      cost: Number
    },

    mealPreferences: {
      breakfast: Boolean,
      dietary: [String] // vegetarian, vegan, halal, etc.
    }
  },

  // Booking status and confirmation
  status: {
    type: String,
    enum: ['draft', 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show', 'completed'],
    default: 'draft'
  },

  // Confirmation and reference numbers
  confirmation: {
    confirmationNumber: String,
    voucherNumber: String,
    supplierReference: String,
    hotelReference: String,
    
    confirmedAt: Date,
    confirmationEmail: String,
    
    // Check-in/out tracking
    checkedInAt: Date,
    checkedOutAt: Date,
    actualCheckOut: Date
  },

  // Communication and notifications
  communications: [{
    type: { type: String, enum: ['email', 'sms', 'push', 'system'] },
    recipient: String,
    subject: String,
    message: String,
    sentAt: Date,
    status: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'] }
  }],

  // Booking modifications history
  modifications: [{
    modifiedAt: { type: Date, default: Date.now },
    modifiedBy: String,
    modificationType: String, // status_change, room_change, date_change, etc.
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed,
    reason: String
  }],

  // Integration and sync status
  syncStatus: {
    lastSyncAt: Date,
    syncErrors: [String],
    needsSync: { type: Boolean, default: false }
  },

  // Metadata
  metadata: {
    source: { type: String, default: 'web' }, // web, mobile, api
    userAgent: String,
    ipAddress: String,
    sessionId: String,
    bookingFlow: String, // direct, comparison, package, etc.
    deviceType: String,
    referrer: String
  }
}, {
  timestamps: true
});

// Create indexes
HotelBookingSchema.index({ hotelBookingRef: 1 });
HotelBookingSchema.index({ 'apiDetails.hotelId': 1 });
HotelBookingSchema.index({ 'leadGuest.travelerId': 1 });
HotelBookingSchema.index({ status: 1 });
HotelBookingSchema.index({ 'stayDetails.checkIn': 1 });
HotelBookingSchema.index({ 'stayDetails.checkOut': 1 });
HotelBookingSchema.index({ createdAt: -1 });
HotelBookingSchema.index({ bookingId: 1, status: 1 });

// Pre-save middleware to calculate nights and validate dates
HotelBookingSchema.pre('save', function(this: IHotelBooking, next) {
  if (this.stayDetails.checkIn && this.stayDetails.checkOut) {
    const checkIn = new Date(this.stayDetails.checkIn);
    const checkOut = new Date(this.stayDetails.checkOut);
    
    if (checkOut <= checkIn) {
      return next(new Error('Check-out date must be after check-in date'));
    }
    
    // Calculate nights
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    this.stayDetails.nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
  
  next();
});

// Instance method to check if booking is modifiable
HotelBookingSchema.methods.isModifiable = function(this: IHotelBooking): boolean {
  const now = new Date();
  const checkIn = new Date(this.stayDetails.checkIn);
  const hoursDiff = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return this.status === 'confirmed' && hoursDiff > 24; // Can modify if more than 24 hours before check-in
};

// Instance method to check if booking is cancellable
HotelBookingSchema.methods.isCancellable = function(this: IHotelBooking): boolean {
  const now = new Date();
  const cancellationDeadline = this.policies.cancellation?.deadline;
  
  if (!cancellationDeadline) return false;
  
  return this.status === 'confirmed' && now < new Date(cancellationDeadline);
};

// Static method to find bookings by date range
HotelBookingSchema.statics.findByDateRange = function(
  startDate: Date, 
  endDate: Date, 
  status: string | null = null
) {
  let query: any = {
    $or: [
      {
        'stayDetails.checkIn': { $gte: startDate, $lte: endDate }
      },
      {
        'stayDetails.checkOut': { $gte: startDate, $lte: endDate }
      },
      {
        $and: [
          { 'stayDetails.checkIn': { $lte: startDate } },
          { 'stayDetails.checkOut': { $gte: endDate } }
        ]
      }
    ]
  };

  if (status) {
    query = {
      $and: [
        query,
        { status: status }
      ]
    };
  }

  return this.find(query);
};

const HotelBooking = baseDbConnection.model('HotelBooking', HotelBookingSchema) as Model<IHotelBooking>;

export { HotelBooking, IHotelBooking };
export default HotelBooking;
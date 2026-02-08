// File: src/utils/bookingHelpers.ts or src/helpers/bookingHelpers.ts

import mongoose, { Document } from 'mongoose';
import Booking from '../models/Bookings';
import { logger } from './logger';

/**
 * Get or create parent booking atomically
 * This prevents race conditions when creating multiple services simultaneously
 * 
 * @param userId - User ID (string or ObjectId)
 * @param tripId - Trip ID (string or ObjectId)
 * @param currency - Currency code (default: INR)
 * @returns Parent booking document
 */
export const getOrCreateParentBooking = async (
  userId: string | mongoose.Types.ObjectId, 
  tripId: string | mongoose.Types.ObjectId, 
  currency: string = 'INR'
) => {
  try {
    const bookingReference = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Convert to ObjectId if string
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    const tripObjectId = typeof tripId === 'string' ? new mongoose.Types.ObjectId(tripId) : tripId;

    logger.info('Getting or creating parent booking', { 
      userId: userObjectId.toString(), 
      tripId: tripObjectId.toString(), 
      currency 
    });

    const parentBooking = await Booking.findOneAndUpdate(
      { 
        userId: userObjectId,
        tripId: tripObjectId,
        status: 'draft'
      },
      {
        $setOnInsert: {
          userId: userObjectId,
          tripId: tripObjectId,
          bookingReference,
          services: { 
            flights: [], 
            hotels: [], 
            cabs: [], 
            activities: [] 
          },
          pricing: {
            totalAmount: 0,
            currency,
            breakdown: { 
              flights: 0, 
              hotels: 0, 
              cabs: 0, 
              activities: 0, 
              taxes: 0, 
              fees: 0, 
              discounts: 0 
            }
          },
          paymentSummary: { 
            totalPaid: 0, 
            totalRefunded: 0, 
            paymentStatus: 'pending' 
          },
          status: 'draft',
        }
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    if (!parentBooking) {
      throw new Error('Failed to create or retrieve parent booking');
    }

    logger.info('Parent booking retrieved/created', { 
      bookingId: parentBooking._id.toString(), 
      isNew: !parentBooking.services.flights.length && !parentBooking.services.hotels.length 
    });

    return parentBooking;
  } catch (error) {
    logger.error('Error in getOrCreateParentBooking', {
      userId: userId.toString(),
      tripId: tripId.toString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

/**
 * Link service to parent booking and update pricing atomically
 * 
 * @param bookingId - Parent booking ID (string or ObjectId)
 * @param serviceType - Type of service ('flights' | 'hotels' | 'cabs' | 'activities')
 * @param serviceId - Service document ID (any type with _id)
 * @param price - Service price (number)
 */
export const linkServiceToBooking = async (
  bookingId: string | mongoose.Types.ObjectId,
  serviceType: 'flights' | 'hotels' | 'cabs' | 'activities',
  serviceId: any, // Accept any document type with _id
  price: number
) => {
  try {
    // Extract _id from document if it's a Mongoose document
    const serviceObjectId = serviceId._id || serviceId;

    const result = await Booking.findByIdAndUpdate(
      bookingId,
      {
        $push: { [`services.${serviceType}`]: serviceObjectId },
        $inc: { 
          'pricing.totalAmount': price,
          [`pricing.breakdown.${serviceType}`]: price
        }
      },
      { new: true }
    );

    if (!result) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    logger.info('Service linked to booking', {
      bookingId: bookingId.toString(),
      serviceType,
      serviceId: serviceObjectId.toString(),
      price,
      newTotal: result.pricing.totalAmount
    });

    return result;
  } catch (error) {
    logger.error('Error linking service to booking', {
      bookingId: bookingId.toString(),
      serviceType,
      serviceId: serviceId.toString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

/**
 * Generate booking reference
 * 
 * @param prefix - Reference prefix (e.g., 'BK', 'HB', 'FL')
 * @returns Unique booking reference
 */
export const generateBookingReference = (prefix: string = 'BK'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};
// src/routes/bookingRoutes.ts
import { Router, Request, Response } from 'express';
import { BookingController } from '../controllers/bookingController';
import { authenticate } from '../middleware/authenticate';
import { serviceAuth } from '../middleware/serviceAuth';
import Booking from '../models/Bookings';
import { Types } from 'mongoose';

const router = Router();
const bookingController = new BookingController();

// Helper function to generate booking reference
const generateBookingReference = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BK${timestamp}${random}`;
};

// Create a new booking (draft)
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      tripId,
      userId,
      travelers,
      services,
      pricing,
      bookingChannel,
      specialRequests
    } = req.body;

    console.log('📝 Creating booking:', { tripId, userId, pricing });

    // Validate required fields
    if (!tripId || !userId) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: tripId, userId'
      });
      return;
    }

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(userId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid userId format'
      });
      return;
    }

    if (!Types.ObjectId.isValid(tripId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid tripId format'
      });
      return;
    }

    // Create booking object with proper validation
    const bookingData = {
      tripId: new Types.ObjectId(tripId),
      userId: new Types.ObjectId(userId),
      bookingReference: generateBookingReference(), // ✅ Required field
      
      // Handle travelers - ensure travelerId is valid ObjectId
      travelers: travelers && travelers.length > 0 
        ? travelers.map((t: any) => ({
            travelerId: Types.ObjectId.isValid(t.travelerId) 
              ? new Types.ObjectId(t.travelerId) 
              : new Types.ObjectId(userId), // Fallback to userId
            isLeadTraveler: t.isLeadTraveler || false
          }))
        : [{
            travelerId: new Types.ObjectId(userId),
            isLeadTraveler: true
          }],
      
      // Handle services - filter out invalid IDs and convert to ObjectIds
      services: {
        flights: services?.flights 
          ? services.flights
              .filter((id: any) => Types.ObjectId.isValid(id))
              .map((id: any) => new Types.ObjectId(id))
          : [],
        hotels: services?.hotels 
          ? services.hotels
              .filter((id: any) => Types.ObjectId.isValid(id))
              .map((id: any) => new Types.ObjectId(id))
          : [],
        cabs: services?.cabs 
          ? services.cabs
              .filter((id: any) => Types.ObjectId.isValid(id))
              .map((id: any) => new Types.ObjectId(id))
          : [],
        activities: services?.activities 
          ? services.activities
              .filter((id: any) => Types.ObjectId.isValid(id))
              .map((id: any) => new Types.ObjectId(id))
          : []
      },
      
      pricing: {
        totalAmount: pricing?.totalAmount || 0,
        currency: pricing?.currency || 'INR',
        breakdown: {
          flights: pricing?.breakdown?.flights || 0,
          hotels: pricing?.breakdown?.hotels || 0,
          cabs: pricing?.breakdown?.cabs || 0,
          taxes: pricing?.breakdown?.taxes || 0,
          fees: pricing?.breakdown?.fees || 0,
          discounts: pricing?.breakdown?.discounts || 0
        }
      },
      
      paymentSummary: {
        totalPaid: 0,
        totalRefunded: 0,
        paymentStatus: 'pending'
      },
      
      status: 'draft',
      bookingChannel: bookingChannel || 'web',
      specialRequests: specialRequests || ''
    };

    console.log('💾 Saving booking to database with reference:', bookingData.bookingReference);
    console.log('📊 Services:', {
      flights: bookingData.services.flights.length,
      hotels: bookingData.services.hotels.length,
      cabs: bookingData.services.cabs.length
    });

    // Create booking in database
    const booking = await Booking.create(bookingData);

    console.log('✅ Booking created successfully:', booking._id);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: booking
    });

  } catch (error) {
    console.error('❌ Error creating booking:', error);
    
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'Failed to create booking',
      details: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    });
  }
});

// ✅ ADD THIS NEW ROUTE - Update payment status (called by payment service)
router.patch('/:bookingId/payment', serviceAuth, async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { paymentStatus, totalPaid, paymentId } = req.body;

    console.log('💳 Updating booking payment status:', {
      bookingId,
      paymentStatus,
      totalPaid,
      paymentId
    });

    // Validate bookingId
    if (!Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid booking ID format'
      });
      return;
    }

    // Find booking
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      console.log('❌ Booking not found:', bookingId);
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
      return;
    }

    console.log('📦 Found booking:', {
      id: booking._id,
      currentStatus: booking.status,
      currentPaymentStatus: booking.paymentSummary?.paymentStatus
    });

    // Update payment summary
    booking.paymentSummary = {
      totalPaid: totalPaid || booking.paymentSummary?.totalPaid || 0,
      totalRefunded: booking.paymentSummary?.totalRefunded || 0,
      paymentStatus: paymentStatus || booking.paymentSummary?.paymentStatus || 'pending'
    };

    // If payment is successful, update booking status to confirmed
    if (paymentStatus === 'paid' && booking.status === 'draft') {
      booking.status = 'confirmed';
      // Only set confirmedAt if your Booking model has this field
      // booking.confirmedAt = new Date();
    }

    await booking.save();

    console.log('✅ Booking payment status updated:', {
      bookingId: booking._id,
      status: booking.status,
      paymentStatus: booking.paymentSummary.paymentStatus,
      totalPaid: booking.paymentSummary.totalPaid
    });

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      booking: {
        id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentSummary.paymentStatus,
        totalPaid: booking.paymentSummary.totalPaid
      }
    });

  } catch (error) {
    console.error('❌ Error updating booking payment:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'Failed to update payment status'
    });
  }
});


// Get booking details
router.get('/:bookingId', serviceAuth, bookingController.getBookingDetails);

// Update booking status
router.patch('/:bookingId/status', serviceAuth, bookingController.updateBookingStatus);

// Confirm booking after payment
router.post('/:bookingId/confirm', authenticate, bookingController.confirmBooking);

// Cancel booking
router.post('/:bookingId/cancel', authenticate, bookingController.cancelBooking);

// Update payment summary
router.patch('/:bookingId/payment-summary', authenticate, bookingController.updatePaymentSummary);

// Health check
router.get('/health', bookingController.healthCheck);

export { router as bookingRoutes };
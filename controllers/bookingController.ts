import { Request, Response } from 'express';
import Booking from '../models/Bookings';
import Traveler from '../models/Traveller';
import { logger } from '../utils/logger';
import { Types } from 'mongoose';

export class BookingController {
  
  // ... your existing methods ...

  /**
   * Get booking details
   * GET /api/bookings/:bookingId
   */
  getBookingDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bookingId } = req.params;
      console.log('Fetching booking details for ID:', bookingId);

      if (!Types.ObjectId.isValid(bookingId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid booking ID format'
        });
        return;
      }

      const booking = await Booking.findById(bookingId)
        .populate('tripId')
        .populate('userId', 'name email')
        // .populate('travelers.travelerId');

      if (!booking) {
        res.status(404).json({
          success: false,
          error: 'Booking not found'
        });
        return;
      }

      res.json({
        success: true,
        booking
      });
    } catch (error) {
      logger.error('Get booking details error', { 
        error: (error as Error).message, 
        bookingId: req.params.bookingId 
      });
      
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  };

  /**
   * Update booking status
   * PATCH /api/bookings/:bookingId/status
   */
  updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bookingId } = req.params;
      const { status, paymentSummary } = req.body;

      if (!Types.ObjectId.isValid(bookingId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid booking ID format'
        });
        return;
      }

      const updateData: any = {};
      
      if (status) {
        updateData.status = status;
      }

      if (paymentSummary) {
        if (paymentSummary.totalPaid !== undefined) {
          updateData['paymentSummary.totalPaid'] = paymentSummary.totalPaid;
        }
        if (paymentSummary.totalRefunded !== undefined) {
          updateData['paymentSummary.totalRefunded'] = paymentSummary.totalRefunded;
        }
        if (paymentSummary.paymentStatus) {
          updateData['paymentSummary.paymentStatus'] = paymentSummary.paymentStatus;
        }
      }

      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!booking) {
        res.status(404).json({
          success: false,
          error: 'Booking not found'
        });
        return;
      }

      logger.info('Booking status updated', { 
        bookingId, 
        status: booking.status,
        paymentStatus: booking.paymentSummary.paymentStatus
      });

      res.json({
        success: true,
        booking
      });
    } catch (error) {
      logger.error('Update booking status error', { 
        error: (error as Error).message, 
        bookingId: req.params.bookingId 
      });
      
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  };

  /**
   * Confirm booking after payment
   * POST /api/bookings/:bookingId/confirm
   */
  confirmBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bookingId } = req.params;
      const { paymentDetails, confirmedAt } = req.body;

      if (!Types.ObjectId.isValid(bookingId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid booking ID format'
        });
        return;
      }

      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          $set: {
            status: 'confirmed',
            'paymentSummary.paymentStatus': 'paid',
            'paymentSummary.totalPaid': paymentDetails.amount,
            confirmedAt: confirmedAt || new Date(),
            paymentDetails: {
              paymentId: paymentDetails.paymentId,
              transactionId: paymentDetails.transactionId,
              amount: paymentDetails.amount
            }
          }
        },
        { new: true }
      );

      if (!booking) {
        res.status(404).json({
          success: false,
          error: 'Booking not found'
        });
        return;
      }

      logger.info('Booking confirmed', { 
        bookingId, 
        paymentId: paymentDetails.paymentId 
      });

      // TODO: Add post-confirmation logic:
      // - Send confirmation email
      // - Update inventory
      // - Trigger other services

      res.json({
        success: true,
        booking
      });
    } catch (error) {
      logger.error('Confirm booking error', { 
        error: (error as Error).message, 
        bookingId: req.params.bookingId 
      });
      
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  };

  /**
   * Cancel booking
   * POST /api/bookings/:bookingId/cancel
   */
  cancelBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bookingId } = req.params;
      const { reason, cancelledAt } = req.body;

      if (!Types.ObjectId.isValid(bookingId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid booking ID format'
        });
        return;
      }

      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          $set: {
            status: 'cancelled',
            cancelledAt: cancelledAt || new Date(),
            cancellationReason: reason
          }
        },
        { new: true }
      );

      if (!booking) {
        res.status(404).json({
          success: false,
          error: 'Booking not found'
        });
        return;
      }

      logger.info('Booking cancelled', { bookingId, reason });

      res.json({
        success: true,
        booking
      });
    } catch (error) {
      logger.error('Cancel booking error', { 
        error: (error as Error).message, 
        bookingId: req.params.bookingId 
      });
      
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  };

  /**
   * Update payment summary
   * PATCH /api/bookings/:bookingId/payment-summary
   */
  updatePaymentSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bookingId } = req.params;
      const { paymentSummary } = req.body;

      if (!Types.ObjectId.isValid(bookingId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid booking ID format'
        });
        return;
      }

      const updateData: any = {};
      
      if (paymentSummary.totalPaid !== undefined) {
        updateData['paymentSummary.totalPaid'] = paymentSummary.totalPaid;
      }
      if (paymentSummary.totalRefunded !== undefined) {
        updateData['paymentSummary.totalRefunded'] = paymentSummary.totalRefunded;
      }
      if (paymentSummary.paymentStatus) {
        updateData['paymentSummary.paymentStatus'] = paymentSummary.paymentStatus;
      }

      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        { $set: updateData },
        { new: true }
      );

      if (!booking) {
        res.status(404).json({
          success: false,
          error: 'Booking not found'
        });
        return;
      }

      res.json({
        success: true,
        booking
      });
    } catch (error) {
      logger.error('Update payment summary error', { 
        error: (error as Error).message, 
        bookingId: req.params.bookingId 
      });
      
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  };

  /**
   * Health check
   */
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      service: 'booking-service',
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  };
}
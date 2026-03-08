import { Request, Response } from 'express';
import Booking from '../models/Bookings';
import Traveler from '../models/Traveller';
import { logger } from '../utils/logger';
import { Types } from 'mongoose';
import HotelBooking from '../models/HotelBooking';
import TransportationBooking from '../models/TransportationBooking';
import FlightBooking from '../models/FlightBooking';
import { EmailService } from '../services/EmailService';
import axios from 'axios';

const emailService = new EmailService();

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

    // ✅ FIRST: fetch booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
      return;
    }

    // ✅ Apply updates
    if (status) {
      booking.status = status;
    }

    if (paymentSummary?.paymentStatus) {
      booking.paymentSummary.paymentStatus = paymentSummary.paymentStatus;
    }

    // 🔥 CASCADE CONFIRMATION
    if (status === 'confirmed' || paymentSummary?.paymentStatus === 'paid') {

      booking.status = 'confirmed';

      // Confirm hotels
      if (booking.services?.hotels?.length) {
        await HotelBooking.updateMany(
          { _id: { $in: booking.services.hotels } },
          { status: 'confirmed' }
        );
      }

      // Confirm cabs
      if (booking.services?.cabs?.length) {
        await TransportationBooking.updateMany(
          { _id: { $in: booking.services.cabs } },
          { status: 'confirmed' }
        );
      }

      // Confirm flights
      if (booking.services?.flights?.length) {
        await FlightBooking.updateMany(
          { _id: { $in: booking.services.flights } },
          { status: 'confirmed' }
        );
      }
    }

    // ✅ Save parent booking
    await booking.save();

    res.json({
      success: true,
      booking
    });

  } catch (error) {
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
  // cancelBooking = async (req: Request, res: Response): Promise<void> => {
  //   const session = await mongoose.startSession();
  //   session.startTransaction();

  //   try {
  //     const { bookingId } = req.params;
  //     const userId = req.session.userId;
  //     const { reason, cancelledAt } = req.body;

  //     if (!Types.ObjectId.isValid(bookingId)) {
  //       res.status(400).json({
  //         success: false,
  //         error: 'Invalid booking ID format'
  //       });
  //       return;
  //     }

  //     const booking = await Booking.findByIdAndUpdate(
  //       bookingId,
  //       {
  //         $set: {
  //           status: 'cancelled',
  //           cancelledAt: cancelledAt || new Date(),
  //           cancellationReason: reason
  //         }
  //       },
  //       { new: true }
  //     );

  //     if (!booking) {
  //       res.status(404).json({
  //         success: false,
  //         error: 'Booking not found'
  //       });
  //       return;
  //     }

  //     logger.info('Booking cancelled', { bookingId, reason });

  //     res.json({
  //       success: true,
  //       booking
  //     });
  //   } catch (error) {
  //     logger.error('Cancel booking error', { 
  //       error: (error as Error).message, 
  //       bookingId: req.params.bookingId 
  //     });
      
  //     res.status(500).json({
  //       success: false,
  //       error: (error as Error).message
  //     });
  //   }
  // };

  cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🔥 Cancel API HIT");

    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
res.status(404).json({ success: false, error: "Booking not found" });
  return;    }

    if (booking.status === "cancelled") {
       res.status(400).json({ success: false, error: "Already cancelled" });
       return;
    }

    let refundResponse = null;

    if (
      booking.paymentId &&
      booking.paymentSummary?.paymentStatus === "paid"
    ) {
      const refundAmount = booking.paymentSummary.totalPaid;
        console.log("💰 Initiating refund for:", booking.paymentId);


      refundResponse = await axios.post(
        `http://localhost:5001/api/payment/${booking.paymentId}/refund`,
        {
          amount: refundAmount,
          reason: reason || "Customer cancellation",
        }
      );
        console.log("✅ Refund response:", refundResponse.data);


      booking.paymentSummary.totalRefunded = refundAmount;
      booking.paymentSummary.paymentStatus = "refunded";
    }

    booking.status = "cancelled";
    booking.set("cancelledAt", new Date());
    booking.set("cancellationReason", reason);

    // Cancel child services
await HotelBooking.updateMany(
  { _id: { $in: booking.services?.hotels || [] } },
  { $set: { status: "cancelled", cancelledAt: new Date() } }
);

await TransportationBooking.updateMany(
  { _id: { $in: booking.services?.cabs || [] } },
  { $set: { status: "cancelled", cancelledAt: new Date() } }
);

await FlightBooking.updateMany(
  { _id: { $in: booking.services?.flights || [] } },
  { $set: { status: "cancelled", cancelledAt: new Date() } }
);

    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      refund: refundResponse?.data || null,
      booking,
    });
    try {
  await emailService.sendCancellationEmail(
    booking._id.toString(),
    booking.paymentSummary?.totalRefunded || 0
  );
} catch (err) {
  console.error("Email failed but cancellation completed");
}

  } catch (error) {
    console.error("Cancel error:", error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
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

    const booking = await Booking.findById(bookingId);
    if (!booking) {
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

    // Update payment fields
    if (paymentSummary?.totalPaid !== undefined) {
      booking.paymentSummary.totalPaid = paymentSummary.totalPaid;
    }

    if (paymentSummary?.paymentStatus) {
      booking.paymentSummary.paymentStatus = paymentSummary.paymentStatus;
    }

    // 🔥 CASCADE CONFIRMATION HERE
    if (paymentSummary?.paymentStatus === 'paid') {

      booking.status = 'confirmed';

      if (booking.services?.hotels?.length) {
        await HotelBooking.updateMany(
          { _id: { $in: booking.services.hotels } },
          { status: 'confirmed' }
        );
        console.log('✅ Hotel bookings confirmed:', booking.services.hotels);
      }

      if (booking.services?.cabs?.length) {
        await TransportationBooking.updateMany(
          { _id: { $in: booking.services.cabs } },
          { status: 'confirmed' }
        );
        console.log('✅ Cab bookings confirmed:', booking.services.cabs);
      }

      if (booking.services?.flights?.length) {
        await FlightBooking.updateMany(
          { _id: { $in: booking.services.flights } },
          { status: 'confirmed' }
        );
      }
      try {
    await emailService.sendBookingConfirmation(booking._id.toString());
    console.log('✅ Booking confirmation email sent');
  } catch (err) {
    console.error('Email sending failed but booking confirmed:', err);
  }
    }

    await booking.save();

    res.json({
      success: true,
      booking
    });

  } catch (error) {
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
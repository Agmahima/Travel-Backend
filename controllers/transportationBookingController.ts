import { Request, Response } from 'express';
import { insertTransportationBookingSchema } from '../shared/schema';
// const TransportationBooking = require('../models/TransportationBooking');
import TransportationBooking from '../models/TransportationBooking'; // Adjust the path as necessary
import { ZodError } from 'zod';

export const transportationBookingController = {
  /**
   * Get all bookings for current user
   */
  getAllBookings: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        res.status(400).json({ message: "User ID is missing in session" });
        return;
      }
      
      const bookings = await TransportationBooking.find({ userId });
      res.status(200).json(bookings);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
    }
  },

  /**
   * Create a new booking
   */
  createBooking: async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = insertTransportationBookingSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const booking = await TransportationBooking.create(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
      }
    }
  },

  /**
   * Get booking by ID
   */
  getBookingById: async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const bookingId = req.params.id;
      const booking = await TransportationBooking.findById(bookingId);
  
      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }
      
      // Check if the booking belongs to the current user
      if (booking.userId.toString() !== req.session.userId) {
        res.status(403).json({ message: "Unauthorized" });
        return;
      }
  
      res.status(200).json(booking);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
    }
  },

  /**
   * Update booking by ID
   */
  updateBooking: async (req: Request<{ id: string }, {}, any>, res: Response): Promise<void> => {
    try {
      const bookingId = req.params.id;
      const booking = await TransportationBooking.findById(bookingId);
  
      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }
      
      // Check if the booking belongs to the current user
      if (booking.userId.toString() !== req.session.userId) {
        res.status(403).json({ message: "Unauthorized" });
        return;
      }
  
      const updatedBooking = await TransportationBooking.findByIdAndUpdate(
        bookingId, 
        req.body, 
        { new: true, runValidators: true }
      );
      
      res.status(200).json(updatedBooking);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
    }
  }
};
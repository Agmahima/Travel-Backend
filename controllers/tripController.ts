import { Request, Response } from 'express';
import { insertTripSchema } from '../shared/schema';
// const Trip = require('../models/Trip');
import Trip from '../models/Trip'; // Adjust the path as necessary
import { ZodError } from 'zod';

export const tripController = {
  /**
   * Get all trips for current user
   */
  getAllTrips: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.query.userId || req.session.userId;
      console.log("User ID from session:", userId); // Log the userId for debugging
      if (!userId) {
        res.status(400).json({ message: "User ID is missing in session" });
        return;
      }
      
      const trips = await Trip.find({ userId });
      res.status(200).json(trips);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
    }
  },

  /**
   * Create a new trip
   */
  createTrip: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Request body:', req.body);
      console.log('Session:', req.session);
      console.log('Session userId:', req.session?.userId);
      const validatedData = insertTripSchema.parse({ 
        ...req.body, 
        // userId: req.session.userId 
        userId: req.body.userId || req.session.userId // Use body or session userId
      });
      
      const trip = await Trip.create(validatedData);
      res.status(201).json(trip);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
        console.error("Error creating trip:", error);
      }
    }
  },

  /**
   * Get trip by ID
   */
  getTripById: async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const tripId = req.params.id;
      const trip = await Trip.findById(tripId);
  
      if (!trip) {
        res.status(404).json({ message: "Trip not found" });
        return;
      }
      
      // Check if the trip belongs to the current user
      if (trip.userId.toString() !== req.session.userId) {
        res.status(403).json({ message: "Unauthorized" });
        return;
      }
  
      res.status(200).json(trip);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
    }
  },

  /**
   * Update trip by ID
   */
  updateTrip: async (req: Request<{ id: string }, any, any>, res: Response): Promise<void> => {
    try {
      const tripId = req.params.id;
      const trip = await Trip.findById(tripId);
  
      if (!trip) {
        res.status(404).json({ message: "Trip not found" });
        return;
      }
      
      // Check if the trip belongs to the current user
      if (trip.userId.toString() !== req.session.userId) {
        res.status(403).json({ message: "Unauthorized" });
        return;
      }
  
      const updatedTrip = await Trip.findByIdAndUpdate(
        tripId, 
        req.body, 
        { new: true, runValidators: true }
      );
      
      res.status(200).json(updatedTrip);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
    }
  },

  /**
   * Delete trip by ID
   */
  deleteTrip: async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const tripId = req.params.id;
      const trip = await Trip.findById(tripId);
  
      if (!trip) {
        res.status(404).json({ message: "Trip not found" });
        return;
      }
      
      // Check if the trip belongs to the current user
      if (trip.userId.toString() !== req.session.userId) {
        res.status(403).json({ message: "Unauthorized" });
        return;
      }
  
      await Trip.findByIdAndDelete(tripId);
      res.status(200).json({ message: "Trip deleted" });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
    }
  }
};
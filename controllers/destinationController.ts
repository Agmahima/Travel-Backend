import { Request, Response } from 'express';
import Destination from '../models/Destination'; // Adjust the path as necessary

export const destinationController = {
  
  getAllDestinations: async (_req: Request, res: Response): Promise<void> => {
    try {
      const destinations = await Destination.find();
      res.status(200).json(destinations);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
    }
  },

  /**
   * Get destination by ID
   */
  getDestinationById: async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const destinationId = req.params.id;
      const destination = await Destination.findById(destinationId);
  
      if (!destination) {
        res.status(404).json({ message: "Destination not found" });
        return;
      }
  
      res.status(200).json(destination);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
    }
  },

  createDestination: async (req: Request, res: Response): Promise<void> => {
    try {
      const newDestination = new Destination(req.body);
      const savedDestination = await newDestination.save();
      res.status(201).json(savedDestination);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
    }
  }
};
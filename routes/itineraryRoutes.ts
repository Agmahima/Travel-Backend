// routes/itineraryDays.ts
import express, { Request, Response, Router } from 'express';
import ItineraryDay from '../models/ItineraryDay'; // Adjust the path as necessary
// import { authenticateToken } from '../middleware/auth'; // Your auth middleware
import { authenticate } from '../middleware/authenticate'; // Adjust the path as necessary

const router: Router = express.Router();

// Interfaces for type safety
interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

interface ItineraryDayData {
  itineraryId: string;
  dayNumber: number;
  date: string | Date;
  location?: string;
  activities?: Array<{
    title?: string;
    description?: string;
    time?: string;
    duration?: string;
    location?: string;
    cost?: string;
    category?: string;
  }>;
  accommodation?: string;
  transportation?: string;
  meals?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  estimatedCost?: number;
}

interface UpdateActivitiesData {
  activities: Array<{
    title?: string;
    description?: string;
    time?: string;
    duration?: string;
    location?: string;
    cost?: string;
    category?: string;
  }>;
}

// POST /api/itinerary-days - Create a new itinerary day
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Creating itinerary day:', req.body);
    
    const {
      itineraryId,
      dayNumber,
      date,
      location,
      activities,
      accommodation,
      transportation,
      meals,
      estimatedCost
    }: ItineraryDayData = req.body;

    const itineraryDay = new ItineraryDay({
      itineraryId,
      dayNumber,
      date: new Date(date),
      location,
      activities: activities || [],
      accommodation,
      transportation,
      meals: meals || {},
      estimatedCost: estimatedCost || 0
    });

    const savedDay = await itineraryDay.save();
    console.log('Itinerary day saved:', savedDay);

    res.status(201).json(savedDay);
  } catch (error: any) {
    console.error('Error creating itinerary day:', error);
    res.status(500).json({ 
      message: 'Error creating itinerary day', 
      error: error.message 
    });
  }
});

// GET /api/itinerary-days/trip/:tripId - Get all itinerary days for a trip
router.get('/trip/:tripId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId }: { tripId: string } = req.params as { tripId: string };
    console.log('Fetching itinerary days for trip:', tripId);

    const itineraryDays = await ItineraryDay.find({ itineraryId: tripId })
      .sort({ dayNumber: 1 });

    console.log('Found itinerary days:', itineraryDays.length);
    res.json(itineraryDays);
  } catch (error: any) {
    console.error('Error fetching itinerary days:', error);
    res.status(500).json({ 
      message: 'Error fetching itinerary days', 
      error: error.message 
    });
  }
});

// GET /api/itinerary-days/:id - Get a specific itinerary day
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id }: { id: string } = req.params as { id: string };
    const itineraryDay = await ItineraryDay.findById(id);

    if (!itineraryDay) {
      res.status(404).json({ message: 'Itinerary day not found' });
      return;
    }

    res.json(itineraryDay);
  } catch (error: any) {
    console.error('Error fetching itinerary day:', error);
    res.status(500).json({ 
      message: 'Error fetching itinerary day', 
      error: error.message 
    });
  }
});

// PUT /api/itinerary-days/:id - Update a specific itinerary day
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id }: { id: string } = req.params as { id: string };
    const updateData: Partial<ItineraryDayData> = req.body;

    console.log('Updating itinerary day:', id, updateData);

    const updatedDay = await ItineraryDay.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedDay) {
      res.status(404).json({ message: 'Itinerary day not found' });
      return;
    }

    res.json(updatedDay);
  } catch (error: any) {
    console.error('Error updating itinerary day:', error);
    res.status(500).json({ 
      message: 'Error updating itinerary day', 
      error: error.message 
    });
  }
});

// DELETE /api/itinerary-days/trip/:tripId - Delete all itinerary days for a trip
router.delete('/trip/:tripId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId }: { tripId: string } = req.params as { tripId: string };
    console.log('Deleting all itinerary days for trip:', tripId);

    const result = await ItineraryDay.deleteMany({ itineraryId: tripId });
    
    console.log('Deleted itinerary days:', result.deletedCount);
    res.json({ 
      message: 'Itinerary days deleted successfully', 
      deletedCount: result.deletedCount 
    });
  } catch (error: any) {
    console.error('Error deleting itinerary days:', error);
    res.status(500).json({ 
      message: 'Error deleting itinerary days', 
      error: error.message 
    });
  }
});

// DELETE /api/itinerary-days/:id - Delete a specific itinerary day
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id }: { id: string } = req.params as { id: string };
    console.log('Deleting itinerary day:', id);

    const deletedDay = await ItineraryDay.findByIdAndDelete(id);

    if (!deletedDay) {
      res.status(404).json({ message: 'Itinerary day not found' });
      return;
    }

    res.json({ 
      message: 'Itinerary day deleted successfully', 
      deletedDay 
    });
  } catch (error: any) {
    console.error('Error deleting itinerary day:', error);
    res.status(500).json({ 
      message: 'Error deleting itinerary day', 
      error: error.message 
    });
  }
});

// PATCH /api/itinerary-days/:id/activities - Update activities for a specific day
router.patch('/:id/activities', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id }: { id: string } = req.params as { id: string };
    const { activities }: UpdateActivitiesData = req.body;

    console.log('Updating activities for day:', id, activities);

    const updatedDay = await ItineraryDay.findByIdAndUpdate(
      id,
      { activities },
      { new: true, runValidators: true }
    );

    if (!updatedDay) {
      res.status(404).json({ message: 'Itinerary day not found' });
      return;
    }

    res.json(updatedDay);
  } catch (error: any) {
    console.error('Error updating activities:', error);
    res.status(500).json({ 
      message: 'Error updating activities', 
      error: error.message 
    });
  }
});

export default router;

// Don't forget to add this route to your main app.ts or server.ts:
// import itineraryDaysRoutes from './routes/itineraryDays';
// app.use('/api/itinerary-days', itineraryDaysRoutes);
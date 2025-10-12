// src/controllers/itineraryController.ts
import { Request, Response } from 'express';
import { aiItineraryRequestSchema, aiItineraryWithTripRequestSchema, aiItineraryResponseSchema } from '../shared/schema';
import ItineraryDay from '../models/ItineraryDay';
import OpenAI from 'openai';
import mongoose from 'mongoose';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'https://your-site-url.com',
    'X-Title': 'TravelPlannerAI',
  },
});

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export const itineraryController = {
  // Generate itinerary (with optional detailed saving if tripId provided)
  generateItinerary: async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      console.log('=== GENERATE ITINERARY ===');
      console.log('Request body:', JSON.stringify(req.body, null, 2));

      // Extract tripId from request body if it exists
      const { tripId, ...itineraryRequestData } = req.body;
      
      // Validate the main itinerary data (without tripId)
      const validatedData = aiItineraryRequestSchema.parse(itineraryRequestData);
      console.log('Validated data:', JSON.stringify(validatedData, null, 2));
      
      // Validate tripId if provided
      let validTripId: string | null = null;
      if (tripId) {
        if (typeof tripId === 'string' && tripId.length === 24 && mongoose.Types.ObjectId.isValid(tripId)) {
          validTripId = tripId;
          console.log('Valid tripId provided:', validTripId);
        } else {
          console.warn('Invalid tripId provided, will generate without saving:', tripId);
        }
      }
      
      const prompt = `
Create a travel itinerary based on:
- Destination: ${validatedData.destination}
- Dates: ${validatedData.startDate} to ${validatedData.endDate}
- Preferences: ${JSON.stringify(validatedData.preferences || {})}
- Custom destinations: ${JSON.stringify(validatedData.destinations || [])}
- Transportation: ${JSON.stringify(validatedData.transportationOptions || [])}

Respond with JSON only (inside \`\`\`json block), like this:
\`\`\`json
{
  "destination": "Name",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "location": "City/Location name",
      "activities": [
        {
          "time": "8:00 AM - 10:00 AM",
          "title": "Visit XYZ",
          "description": "Some detail...",
          "location": "Place",
          "cost": "$10",
          "category": "morning",
          "duration": "2 hours"
        }
      ],
      "accommodation": "Hotel name or type",
      "transportation": "Transport method",
      "meals": {
        "breakfast": "Restaurant/meal suggestion",
        "lunch": "Restaurant/meal suggestion", 
        "dinner": "Restaurant/meal suggestion"
      },
      "estimatedCost": 100
    }
  ]
}
\`\`\`
`;

      console.log('=== CALLING OPENAI API ===');
      const completion = await openai.chat.completions.create({
        model: "openai/gpt-oss-20b:free",
        messages: [
          { role: "system", content: "You are an expert travel planner." },
          { role: "user", content: prompt }
        ]
      });

      const content = completion.choices?.[0]?.message?.content;
      console.log('OpenAI response:', content);

      if (!content) throw new Error("AI did not return any itinerary");

      // Extract JSON safely from Markdown if wrapped in ```json
      const match = content.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonText = match ? match[1].trim() : content.trim();
      
      console.log('Extracted JSON:', jsonText);
      
      let itinerary;
      try {
        itinerary = JSON.parse(jsonText);
        console.log('Parsed itinerary:', JSON.stringify(itinerary, null, 2));
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Failed to parse AI response as JSON');
      }

      // Validate the AI response structure
      const validatedItinerary = aiItineraryResponseSchema.parse(itinerary);
      console.log('Validated AI response successfully');

      // If tripId is provided, also save detailed itinerary
      if (validTripId) {
        try {
          console.log('=== SAVING DETAILED ITINERARY ===');
          const savedDays = await saveDetailedItineraryHelper(validTripId, validatedItinerary);
          console.log(`Successfully saved ${savedDays.totalDays} days to database`);
        } catch (saveError: any) {
          console.error('Error saving detailed itinerary:', saveError);
          // Don't fail the whole request if detailed saving fails
          // The user still gets the itinerary, just not the detailed version
        }
      } else {
        console.log('No valid tripId provided, skipping detailed itinerary save');
      }

      res.status(200).json(validatedItinerary);
    } catch (error: any) {
      console.error('=== ERROR IN GENERATE ITINERARY ===');
      console.error('Error:', error);
      
      if (error.name === 'ZodError') {
        console.error('Zod validation errors:', error.errors);
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else if (error?.message?.includes('Unexpected token')) {
        res.status(500).json({ message: "AI returned invalid JSON format" });
      } else {
        res.status(500).json({ message: error.message || "Something went wrong" });
      }
    }
  },

  // NEW: Save detailed itinerary endpoint
  saveDetailedItinerary: async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      console.log('=== SAVE DETAILED ITINERARY ENDPOINT ===');
      const { tripId, itineraryData } = req.body;

      if (!tripId) {
        res.status(400).json({ message: 'Trip ID is required' });
        return;
      }

      if (!itineraryData) {
        res.status(400).json({ message: 'Itinerary data is required' });
        return;
      }

      // Validate tripId format
      if (!mongoose.Types.ObjectId.isValid(tripId)) {
        res.status(400).json({ message: 'Invalid trip ID format' });
        return;
      }

      const savedDays = await saveDetailedItineraryHelper(tripId, itineraryData);
      
      res.status(200).json({ 
        message: 'Detailed itinerary saved successfully',
        savedDays: savedDays.totalDays,
        data: savedDays 
      });
    } catch (error: any) {
      console.error('Error in saveDetailedItinerary endpoint:', error);
      res.status(500).json({ message: error.message || 'Failed to save detailed itinerary' });
    }
  },

  // NEW: Create itinerary day
  createItineraryDay: async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const itineraryDay = await ItineraryDay.create(req.body);
      res.status(201).json(itineraryDay);
    } catch (error: any) {
      console.error('Error creating itinerary day:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // NEW: Get itinerary days by trip
  getItineraryDaysByTrip: async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { tripId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(tripId)) {
        res.status(400).json({ message: 'Invalid trip ID' });
        return;
      }

      const itinerary = await ItineraryDay.findOne({ 
        itineraryId: new mongoose.Types.ObjectId(tripId) 
      });

      if(!itinerary) {
        res.status(404).json({message: 'Itinerary not found for this trip'});
        return;
      }
      
      res.status(200).json(itinerary);
    } catch (error: any) {
      console.error('Error fetching itinerary days:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // NEW: Delete itinerary days by trip
  deleteItineraryDaysByTrip: async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { tripId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(tripId)) {
        res.status(400).json({ message: 'Invalid trip ID' });
        return;
      }

      const result = await ItineraryDay.deleteOne({ 
        itineraryId: new mongoose.Types.ObjectId(tripId) 
      });
      
      res.status(200).json({ 
        message: result.deletedCount>0 ? 'Itinerary deleted successfully':'No itinerary found to delete',
        deletedCount: result.deletedCount 
      });
    } catch (error: any) {
      console.error('Error deleting itinerary days:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // NEW: Update itinerary day activities
  updateItineraryDayActivities: async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { tripId } = req.params;
      // const { activities } = req.body;
      const {dayNumber, activities} = req.body;

      
      if (!mongoose.Types.ObjectId.isValid(tripId)) {
        res.status(400).json({ message: 'Invalid day ID' });
        return;
      }

      if(!dayNumber || !activities){
        res.status(400).json({ message: 'Day number and activities are required' });
        return;
      }

      const updatedItinerary = await ItineraryDay.findOneAndUpdate(
        {
          itineraryId: new mongoose.Types.ObjectId(tripId),
          'days.dayNumber': dayNumber
        },

        { 
          $set: {
            'days.$.activities': activities
          }
        },
        { new: true, runValidators: true }

      );
      
      if (!updatedItinerary) {
        res.status(404).json({ message: 'Itinerary day not found' });
        return;
      }

      
      res.status(200).json(updatedItinerary);
    } catch (error: any) {
      console.error('Error updating itinerary day activities:', error);
      res.status(500).json({ message: error.message });
    }
  },

  addDayToItinerary: async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { tripId } = req.params;
      const dayData = req.body;
      
      if (!mongoose.Types.ObjectId.isValid(tripId)) {
        res.status(400).json({ message: 'Invalid trip ID' });
        return;
      }

      const updatedItinerary = await ItineraryDay.findOneAndUpdate(
        { itineraryId: new mongoose.Types.ObjectId(tripId) },
        { 
          $push: { days: dayData },
          $inc: { totalDays: 1 }
        },
        { new: true, runValidators: true }
      );
      
      if (!updatedItinerary) {
        res.status(404).json({ message: 'Itinerary not found' });
        return;
      }
      
      res.status(200).json(updatedItinerary);
    } catch (error: any) {
      console.error('Error adding day to itinerary:', error);
      res.status(500).json({ message: error.message });
    }
  },

   removeDayFromItinerary: async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { tripId, dayNumber } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(tripId)) {
        res.status(400).json({ message: 'Invalid trip ID' });
        return;
      }

      const updatedItinerary = await ItineraryDay.findOneAndUpdate(
        { itineraryId: new mongoose.Types.ObjectId(tripId) },
        { 
          $pull: { days: { dayNumber: parseInt(dayNumber) } },
          $inc: { totalDays: -1 }
        },
        { new: true }
      );
      
      if (!updatedItinerary) {
        res.status(404).json({ message: 'Itinerary not found' });
        return;
      }
      
      res.status(200).json(updatedItinerary);
    } catch (error: any) {
      console.error('Error removing day from itinerary:', error);
      res.status(500).json({ message: error.message });
    }
  }
};

// Helper function to save detailed itinerary to MongoDB (renamed to avoid confusion)
const saveDetailedItineraryHelper = async (tripId: string, itineraryData: any) => {
  try {
    console.log('=== SAVE DETAILED ITINERARY HELPER ===');
    console.log('Trip ID:', tripId);
    console.log('Itinerary Data:', JSON.stringify(itineraryData, null, 2));

    if (!itineraryData || !itineraryData.days || !Array.isArray(itineraryData.days)) {
      throw new Error('Invalid itinerary data provided - missing days array');
    }

    // Convert tripId to ObjectId
    const objectId = new mongoose.Types.ObjectId(tripId);
    console.log('Converted ObjectId:', objectId);
    
    // Delete existing itinerary days for this trip
    console.log('=== DELETING EXISTING DAYS ===');
    const deleteResult = await ItineraryDay.deleteMany({ itineraryId: objectId });
    console.log(`Deleted ${deleteResult.deletedCount} existing days`);

    // const savedDays: any[] = [];
    const processedDays: any[] = [];

    console.log(`=== PROCESSING ${itineraryData.days.length} DAYS ===`);
    
    for (const day of itineraryData.days) {
      console.log(`\n--- Processing Day ${day.day} ---`);
      console.log('Day data:', JSON.stringify(day, null, 2));

      // Validate required fields
      if (!day.day || !day.date) {
        console.warn(`Skipping day due to missing required fields:`, day);
        continue;
      }

      // Validate and parse date
      const dayDate = new Date(day.date);
      if (isNaN(dayDate.getTime())) {
        console.warn(`Invalid date for day ${day.day}: ${day.date}`);
        continue;
      }

      // Prepare day data according to your ItineraryDay model
      const dayData = {
        itineraryId: objectId,
        dayNumber: Number(day.day),
        date: dayDate,
        location: String(day.location || ''),
        activities: Array.isArray(day.activities) ? day.activities.map((activity: any) => ({
          title: String(activity.title || ''),
          description: String(activity.description || ''),
          time: String(activity.time || ''),
          duration: String(activity.duration || ''),
          location: String(activity.location || ''),
          cost: String(activity.cost || ''),
          category: ['morning', 'lunch', 'afternoon', 'evening'].includes(activity.category) 
            ? activity.category 
            : 'other',
        })) : [],
        accommodation: String(day.accommodation || ''),
        transportation: String(day.transportation || ''),
        meals: {
          breakfast: String(day.meals?.breakfast || ''),
          lunch: String(day.meals?.lunch || ''),
          dinner: String(day.meals?.dinner || ''),
        },
        estimatedCost: Number(day.estimatedCost) || 0,
      };
      processedDays.push(dayData);
      // console.log(`Prepared day data for saving:`, JSON.stringify(dayData, null, 2));
    }
      
      processedDays.sort((a,b) => a.dayNumber - b.dayNumber);

      const itineraryDocument = {
        itineraryId :objectId,
        destination:String(itineraryData.destination || ''),
        totalDays: processedDays.length,
        days: processedDays
      }

      console.log('=== Saving complete itinerary Document ===');
      console.log('Document to save:', JSON.stringify(itineraryDocument, null,2));

      try {
        const savedItinerary = await ItineraryDay.create(itineraryDocument);
        console.log(`✅ Successfully saved complete itinerary with ID:`, savedItinerary._id);
        console.log(`✅ Total days saved: ${processedDays.length}`);

        return {
          itineraryId : savedItinerary._id,
          tripId: objectId,
          totalDays:processedDays.length,
          days: processedDays
        };
      }catch(saveError: any) {
        console.log('Error saving complete itinerary:', saveError);
        console.error('save error details:', saveError);

        if(saveError.errros) {
          console.log('validation errors:', saveError.errors);
        }
        throw saveError;
      }

    } catch(error: any) {
        console.error('Error in saveDetailedItineraryHelper:', error);
        throw new Error(`Failed to save detailed itinerary: ${error.message}`);
        throw error;
      }

  }
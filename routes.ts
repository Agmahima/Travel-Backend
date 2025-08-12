// require('dotenv').config();

// import type { Express, Request, Response, NextFunction } from "express";
// import { createServer, type Server } from "http";
// import { storage } from "./storage";

// import OpenAI from "openai";
// import { 
//   insertUserSchema, 
//   insertTripSchema, 
//   insertTransportationBookingSchema, 
//   aiItineraryRequestSchema 
// } from "./shared/schema";
// import session from 'express-session';
// import MemoryStore from 'memorystore';
// import './types';
// import express, { request } from 'express';
// import { ZodError } from "zod";

// // Initialize OpenAI
// if (!process.env.OPENAI_API_KEY) {
//   console.error("WARNING: OPENAI_API_KEY is not set. Itinerary generation will not work.");
// }
// const openai = new OpenAI({ 
//   apiKey: process.env.OPENAI_API_KEY || 'missing-api-key'
// });

// export async function registerRoutes(app: Express): Promise<Server> {
//   const SessionStore = MemoryStore(session);
//   app.use(session({
//     secret: 'travelease-secret-key',
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 86400000 },
//     store: new SessionStore({ checkPeriod: 86400000 })
//   }));

//   const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
//     if (!req.session.userId) {
//       res.status(401).json({ message: "Unauthorized" });
//       return;
//     }
//     next();
//   };

//   app.post('/api/register', async (req: Request, res: Response): Promise<void> => {
//     try {
//       const validatedData = insertUserSchema.parse(req.body);
      
//       const existingUser = await storage.getUserByUsername(validatedData.username);
//       if (existingUser) {
//         res.status(400).json({ message: "Username already exists" });
//         return;
//       }
  
//       const existingEmail = await storage.getUserByEmail(validatedData.email);
//       if (existingEmail) {
//         res.status(400).json({ message: "Email already exists" });
//         return;
//       }
  
//       const newUser = await storage.createUser(validatedData);
//       req.session.userId = newUser.id;
  
//       const { password, ...userWithoutPassword } = newUser;
//       res.status(201).json(userWithoutPassword);
//     } catch (error) {
//       res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
//     }
//   });

//   app.post('/api/login', async (req: Request, res: Response): Promise<void> => {
//     try {
//       const { username, password } = req.body;
//       const user = await storage.getUserByUsername(username);
  
//       if (!user || user.password !== password) {
//         res.status(401).json({ message: "Invalid credentials" });
//         return;
//       }
  
//       req.session.userId = user.id;
//       const { password: _, ...userWithoutPassword } = user;
//       res.status(200).json(userWithoutPassword);
//     } catch (error) {
//       res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
//     }
//   });

//   app.post('/api/logout', (req, res) => {
//     req.session.destroy(err => {
//       if (err) return res.status(500).json({ message: "Logout failed" });
//       res.status(200).json({ message: "Logged out successfully" });
//     });
//   });

//   app.get('/api/user', requireAuth, async (req: Request, res: Response): Promise<void> => {
//     try {
//       if (!req.session.userId) {
//         res.status(400).json({ message: "User ID is missing in session" });
//         return;
//       }
//       const user = await storage.getUser(req.session.userId);
//       if (!user) {
//         res.status(404).json({ message: "User not found" });
//         return;
//       }
  
//       const { password, ...userWithoutPassword } = user;
//       res.status(200).json(userWithoutPassword);
//     } catch (error) {
//       res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
//     }
//   });

//   // DESTINATION ROUTES
//   app.get('/api/destinations', async (_req, res) => {
//     try {
//       const destinations = await storage.getDestinations();
//       res.status(200).json(destinations);
//     } catch (error) {
//       res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
//     }
//   });

//   app.get('/api/destinations/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
//     try {
//       const destinationId = Number(req.params.id);
//       const destination = await storage.getDestination(destinationId);
  
//       if (!destination) {
//         res.status(404).json({ message: "Not found" });
//         return;
//       }
  
//       res.status(200).json(destination);
//     } catch (error) {
//       res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
//     }
//   });

//   // TRIP ROUTES
//   app.get('/api/trips', requireAuth, async (req, res) => {
//     try {
//       const userId = req.session.userId;
//       if (!userId) {
//         res.status(400).json({ message: "User ID is missing in session" });
//         return;
//       }
//       const trips = await storage.getTrips(userId);
//       res.status(200).json(trips);
//     } catch (error) {
//       res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
//     }
//   });

//   app.post('/api/trips', requireAuth, async (req, res) => {
//     try {
//       const validatedData = insertTripSchema.parse({ ...req.body, userId: req.session.userId });
//       const trip = await storage.createTrip(validatedData);
//       res.status(201).json(trip);
//     } catch (error) {
//       res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
//     }
//   });

//   app.get('/api/trips/:id', requireAuth, async (
//     req: Request<{ id: string }>, 
//     res: Response
//   ): Promise<void> => {
//     try {
//       const tripId = Number(req.params.id);
//       const trip = await storage.getTrip(tripId);
  
//       if (!trip || trip.userId !== req.session.userId) {
//         res.status(trip ? 403 : 404).json({ message: trip ? "Unauthorized" : "Trip not found" });
//       }
  
//       res.status(200).json(trip);
//     } catch (error) {
//       res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
//     }
//   });

//   app.patch('/api/trips/:id', requireAuth, async (
//     req: Request<{ id: string }, any, any>, 
//     res: Response
//   ): Promise<void> => {
//     try {
//       const tripId = Number(req.params.id);
//       const trip = await storage.getTrip(tripId);
  
//       if (!trip || trip.userId !== req.session.userId) {
//         res.status(trip ? 403 : 404).json({ message: trip ? "Unauthorized" : "Trip not found" });
//         return;
//       }
  
//       const updated = await storage.updateTrip(tripId, req.body);
//       res.status(200).json(updated);
//     } catch (error) {
//       res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
//     }
//   });
  

//   app.delete('/api/trips/:id', requireAuth, async (
//     req: Request<{ id: string }>, 
//     res: Response
//   ): Promise<void> => {
//     try {
//       const id = Number(req.params.id);
//       const trip = await storage.getTrip(id);
  
//       if (!trip || trip.userId !== req.session.userId) {
//         res.status(trip ? 403 : 404).json({ message: trip ? "Unauthorized" : "Trip not found" });
//       }
  
//       await storage.deleteTrip(id);
//       res.status(200).json({ message: "Trip deleted" });
//     } catch (error) {
//       res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
//     }
//   });

//   // TRANSPORTATION ROUTES
//   app.get('/api/transportation-bookings', requireAuth, async (req, res) => {
//     try {
//       const userId = req.session.userId;
//       if (!userId) {
//         res.status(400).json({ message: "User ID is missing in session" });
//         return;
//       }
//       const bookings = await storage.getTransportationBookings(userId);
//       res.status(200).json(bookings);
//     } catch (error) {
//       res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
//     }
//   });

//   app.post('/api/transportation-bookings', requireAuth, async (req, res) => {
//     try {
//       const validatedData = insertTransportationBookingSchema.parse({
//         ...req.body,
//         userId: req.session.userId
//       });
//       const newBooking = await storage.createTransportationBooking(validatedData);
//       res.status(201).json(newBooking);
//     } catch (error) {
//       res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
//     }
//   });

//   app.get('/api/transportation-bookings/:id', requireAuth, async (
//     req: Request<{ id: string }>, 
//     res: Response
//   ): Promise<void> => {
//     try {
//       const bookingId = Number(req.params.id);
//       const booking = await storage.getTransportationBooking(bookingId);
  
//       if (!booking || booking.userId !== req.session.userId) {
//         res.status(booking ? 403 : 404).json({ message: booking ? "Unauthorized" : "Booking not found" });
//       }
  
//       res.status(200).json(booking);
//     } catch (error) {
//       res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
//     }
//   });

//   app.patch('/api/transportation-bookings/:id', requireAuth, async (
//     req: Request<{ id: string }, {}, any>, 
//     res: Response
//   ): Promise<void> => {
//     try {
//       const id = Number(req.params.id);
//       const booking = await storage.getTransportationBooking(id);
  
//       if (!booking || booking.userId !== req.session.userId) {
//         res.status(booking ? 403 : 404).json({ message: booking ? "Unauthorized" : "Booking not found" });
//         return;
//       }
  
//       const updated = await storage.updateTransportationBooking(id, req.body);
//       res.status(200).json(updated);
//     } catch (error) {
//       res.status(400).json({ message: error instanceof Error ? error.message : "Unknown error" });
//     }
//   });

//   // AI ITINERARY ROUTE
//   app.post('/api/generate-itinerary', requireAuth, async (
//     req: Request<{}, {}, { destination: string; startDate: string; endDate: string; preferences?: object; destinations?: object[]; transportationOptions?: object[] }>, 
//     res: Response
//   ): Promise<void> => {
//     try {
//       if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'missing-api-key') {
//         res.status(500).json({ message: "OpenAI API key not configured." });
//       }
  
//       const validatedData = aiItineraryRequestSchema.parse(req.body);
  
//       const prompt = `
//         Create a travel itinerary based on the following input:
//         - Destination: ${validatedData.destination}
//         - Start: ${validatedData.startDate}, End: ${validatedData.endDate}
//         - Preferences: ${JSON.stringify(validatedData.preferences || {})}
//         - Destinations: ${JSON.stringify(validatedData.destinations || [])}
//         - Transportation: ${JSON.stringify(validatedData.transportationOptions || [])}
  
//         Return in this JSON format:
//         {
//           "destination": "Name",
//           "destinations": [...],
//           "days": [
//             {
//               "day": 1,
//               "date": "YYYY-MM-DD",
//               "activities": [
//                 {
//                   "time": "8:00 AM - 10:00 AM",
//                   "title": "Visit XYZ",
//                   "description": "...",
//                   "location": "...",
//                   "cost": "USD",
//                   "category": "morning",
//                   "booked": false
//                 }
//               ]
//             }
//           ]
//         }
//       `;
  
//       const response = await openai.chat.completions.create({
//         model: "gpt-4o",
//         messages: [
//           { role: "system", content: "You are an expert travel planner." },
//           { role: "user", content: prompt }
//         ]
//       });
  
//       const itinerary = response.choices[0]?.message?.content;
//       if (!itinerary) throw new Error("No response from OpenAI");
  
//       res.status(200).json(JSON.parse(itinerary));
//     } catch (error) {
//       const msg = error instanceof Error ? error.message : "Error generating itinerary";
//       res.status(400).json({ message: msg });
//     }
//   });
//   return createServer(app);
// }


import express, { type Express } from 'express';
import { createServer, type Server } from 'http';
import session from 'express-session';
import MemoryStore from 'memorystore';
import './types';
import { userController } from './controllers/userController';
import { destinationController } from './controllers/destinationController';
import { tripController } from './controllers/tripController';
import { transportationBookingController } from './controllers/transportationBookingController';
import { itineraryController } from './controllers/itineryController';
import { authenticate } from './middleware/authenticate';

export async function registerRoutes(app: Express): Promise<Server> {
  const SessionStore = MemoryStore(session);
  app.use(session({
    secret: 'travelease-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 86400000 },
    store: new SessionStore({ checkPeriod: 86400000 })
  }));

  // Auth Routes
  // app.post('/api/register', userController.register);
  // app.post('/api/login', userController.login);
  // app.post('/api/logout', userController.logout);
  // app.get('/api/user',  userController.getCurrentUser);

  app.post('/api/auth/register', userController.register);
  app.post('/api/auth/login', userController.login);
  app.post('/api/auth/logout', userController.logout);
  app.get('/api/auth/me', authenticate, userController.getCurrentUser);

  // Destination Routes
  app.get('/api/destinations', destinationController.getAllDestinations);
  app.get('/api/destinations/:id', destinationController.getDestinationById);
  app.post('/api/destinations', destinationController.createDestination);

  // Trip Routes
  app.get('/api/trips',  tripController.getAllTrips);
  app.post('/api/trips',  tripController.createTrip);
  app.get('/api/trips/:id',  tripController.getTripById);
  app.patch('/api/trips/:id',  tripController.updateTrip);
  app.delete('/api/trips/:id',  tripController.deleteTrip);

  // Transportation Routes
  app.get('/api/transportation-bookings',  transportationBookingController.getAllBookings);
  app.post('/api/transportation-bookings',  transportationBookingController.createBooking);
  app.get('/api/transportation-bookings/:id',  transportationBookingController.getBookingById);
  app.patch('/api/transportation-bookings/:id',  transportationBookingController.updateBooking);

  // AI Itinerary Route
  app.post('/api/generate-itinerary',  itineraryController.generateItinerary);

  return createServer(app);
}
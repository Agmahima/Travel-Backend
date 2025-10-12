// shared/schema.ts - MongoDB focused with Zod validation
import { z } from "zod";

// Define destination stop schema
export const destinationStopSchema = z.object({
  location: z.string().min(1, "Location is required"),
  daysToStay: z.number().min(1, "Days to stay must be at least 1")
});

// Define transportation option schema
export const transportationOptionSchema = z.object({
  fromDestination: z.number(),
  toDestination: z.number(),
  mode: z.enum(['train', 'bus', 'car', 'flight']),
  booked: z.boolean().default(false)
});

// Schema for validating individual ACTIVITY (what AI returns)
export const activitySchema = z.object({
  title: z.string().default(''),
  description: z.string().default(''),
  time: z.string().default(''),
  duration: z.string().default(''),
  location: z.string().default(''),
  cost: z.string().default(''),
  category: z.enum(["morning",
    "lunch",
    "afternoon",
    "evening",
    "other",
    "cultural",
    "meal",
    "educational",
    "shopping",
    "travel",
    "nature",
  "sightseeing",
    "food",
  "night",
"midday"]).default('other')
});

// Schema for validating MEALS (what AI returns)
export const mealsSchema = z.object({
  breakfast: z.string().default(''),
  lunch: z.string().default(''),
  dinner: z.string().default('')
});

// Schema for validating individual DAY (what AI returns)
export const itineraryDaySchema = z.object({
  day: z.number().min(1, "Day number must be at least 1"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  location: z.string().default(''),
  activities: z.array(activitySchema).default([]),
  accommodation: z.string().default(''),
  transportation: z.string().default(''),
  meals: mealsSchema.default({}),
  estimatedCost: z.number().default(0)
});

// Schema for validating the complete ITINERARY response (what AI returns)
export const aiItineraryResponseSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  days: z.array(itineraryDaySchema).min(1, "At least one day is required")
});

// AI Itinerary request schema WITHOUT tripId (for regular generate endpoint)
export const aiItineraryRequestSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
  destinations: z.array(destinationStopSchema).optional(),
  transportationOptions: z.array(transportationOptionSchema).optional(),
  preferences: z.object({
    activities: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    budget: z.string().optional(),
    travelStyle: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
});

// AI Itinerary request schema WITH tripId (for generate-and-save endpoint)
export const aiItineraryWithTripRequestSchema = aiItineraryRequestSchema.extend({
  tripId: z.string().min(1, "Trip ID is required"),
});

// User schema for MongoDB
export const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email format"),
  fullName: z.string().min(1, "Full name is required"),
});

// Destination schema for MongoDB
export const insertDestinationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  country: z.string().min(1, "Country is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().url("Invalid image URL"),
  rating: z.string().optional(),
  pricePerPerson: z.number().optional(),
  badge: z.string().optional(),
});

// Trip schema for MongoDB (using MongoDB ObjectId strings)
export const insertTripSchema = z.object({
  userId: z.string().length(24, "Invalid userId - must be MongoDB ObjectId"),
  destinations: z.array(destinationStopSchema).optional(),
  destination: z.string().optional(), // backward compatibility
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  adults: z.number().min(1, "At least 1 adult required"),
  children: z.number().optional().default(0),
  preferences: z.record(z.any()).optional(),
  itinerary: z.any().optional(),
  status: z.string().optional().default("planned")
});

// Transportation booking schema for MongoDB
export const insertTransportationBookingSchema = z.object({
  tripId: z.string().length(24, "Invalid tripId - must be MongoDB ObjectId"),
  userId: z.string().length(24, "Invalid userId - must be MongoDB ObjectId"),
  driverName: z.string().optional(),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  serviceLevel: z.string().min(1, "Service level is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  price: z.number().min(0, "Price cannot be negative"),
});

// Schema for inserting into MongoDB ItineraryDay collection
export const insertItineraryDaySchema = z.object({
  itineraryId: z.string().length(24, "Invalid itineraryId - must be MongoDB ObjectId"), // Note: using itineraryId like your model
  dayNumber: z.number().min(1, "Day number must be at least 1"),
  date: z.coerce.date(),
  location: z.string().default(''),
  activities: z.array(activitySchema).default([]),
  accommodation: z.string().default(''),
  transportation: z.string().default(''),
  meals: mealsSchema.default({}),
  estimatedCost: z.number().default(0)
});

// Schema for updating itinerary day activities
export const updateItineraryDayActivitiesSchema = z.object({
  activities: z.array(activitySchema)
});

// Define types from schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type InsertTransportationBooking = z.infer<typeof insertTransportationBookingSchema>;
export type InsertItineraryDay = z.infer<typeof insertItineraryDaySchema>;

// AI-related types
export type AIItineraryRequest = z.infer<typeof aiItineraryRequestSchema>;
export type AIItineraryWithTripRequest = z.infer<typeof aiItineraryWithTripRequestSchema>;
export type AIItineraryResponse = z.infer<typeof aiItineraryResponseSchema>;
export type ItineraryDayData = z.infer<typeof itineraryDaySchema>;
export type Activity = z.infer<typeof activitySchema>;
export type Meals = z.infer<typeof mealsSchema>;

// Other types
export type DestinationStop = z.infer<typeof destinationStopSchema>;
export type TransportationOption = z.infer<typeof transportationOptionSchema>;
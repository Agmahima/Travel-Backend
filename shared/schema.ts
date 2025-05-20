import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
});

// Destinations schema
export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  rating: text("rating"),
  pricePerPerson: integer("price_per_person"),
  badge: text("badge"),
});

export const insertDestinationSchema = createInsertSchema(destinations).pick({
  name: true,
  country: true,
  description: true,
  imageUrl: true,
  rating: true,
  pricePerPerson: true,
  badge: true,
});

// Trips schema
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  destination: text("destination").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  adults: integer("adults").notNull(),
  children: integer("children").default(0),
  itinerary: jsonb("itinerary"),
  preferences: jsonb("preferences"),
  status: text("status").default("planned"),
});

export const insertTripSchema = createInsertSchema(trips).pick({
  userId: true,
  destination: true,
  startDate: true,
  endDate: true,
  adults: true,
  children: true,
  preferences: true,
});

// Transportation bookings schema
export const transportationBookings = pgTable("transportation_bookings", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull(),
  userId: integer("user_id").notNull(),
  driverName: text("driver_name"),
  vehicleType: text("vehicle_type").notNull(),
  serviceLevel: text("service_level").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").default("booked"),
  price: integer("price").notNull(),
});

export const insertTransportationBookingSchema = createInsertSchema(transportationBookings).pick({
  tripId: true,
  userId: true,
  driverName: true,
  vehicleType: true,
  serviceLevel: true,
  startDate: true,
  endDate: true,
  price: true,
});

// Define types from schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type Destination = typeof destinations.$inferSelect;

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;

export type InsertTransportationBooking = z.infer<typeof insertTransportationBookingSchema>;
export type TransportationBooking = typeof transportationBookings.$inferSelect;

// Define destination stop schema
export const destinationStopSchema = z.object({
  location: z.string(),
  daysToStay: z.number()
});

// Define transportation option schema
export const transportationOptionSchema = z.object({
  fromDestination: z.number(),
  toDestination: z.number(),
  mode: z.enum(['train', 'bus', 'car', 'flight']),
  booked: z.boolean().default(false)
});

// AI Itinerary request schema
export const aiItineraryRequestSchema = z.object({
  // For backwards compatibility
  destination: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  // Multi-destination support
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

export type AIItineraryRequest = z.infer<typeof aiItineraryRequestSchema>;
export type DestinationStop = z.infer<typeof destinationStopSchema>;
export type TransportationOption = z.infer<typeof transportationOptionSchema>;

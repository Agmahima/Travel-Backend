import express, { type Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import "./types";
import { userController } from "./controllers/userController";
import { destinationController } from "./controllers/destinationController";
import { tripController } from "./controllers/tripController";
import { transportationBookingController } from "./controllers/transportationBookingController";
import { itineraryController } from "./controllers/itineryController";
import { authenticate } from "./middleware/authenticate";
// import {HotelController} from "./controllers/hotelController";
import HotelController from "./controllers/hotelController";

export async function registerRoutes(app: Express): Promise<Server> {
  const SessionStore = MemoryStore(session);

  app.use(
    session({
      secret: "travelease-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 86400000,
      },
      store: new SessionStore({ checkPeriod: 86400000 }),
    })
  );

  // Auth Routes
  app.post("/api/auth/register", userController.register);
  app.post("/api/auth/login", userController.login);
  app.post("/api/auth/logout", userController.logout);
  app.get("/api/auth/me", authenticate, userController.getCurrentUser);

  // Destination Routes
  app.get("/api/destinations", destinationController.getAllDestinations);
  app.get("/api/destinations/:id", destinationController.getDestinationById);
  app.post("/api/destinations", destinationController.createDestination);

  // Trip Routes
  app.get("/api/trips", authenticate, tripController.getAllTrips);
  app.post("/api/trips", authenticate, tripController.createTrip);
  app.get("/api/trips/:id", authenticate, tripController.getTripById);
  app.patch("/api/trips/:id", authenticate, tripController.updateTrip);
  app.delete("/api/trips/:id", authenticate, tripController.deleteTrip);

  // Transportation Routes
  app.get(
    "/api/transportation-bookings",
    authenticate,
    transportationBookingController.getAllBookings
  );
  app.post(
    "/api/transportation-bookings",
    authenticate,
    transportationBookingController.createBooking
  );
  app.get(
    "/api/transportation-bookings/:id",
    authenticate,
    transportationBookingController.getBookingById
  );
  app.patch(
    "/api/transportation-bookings/:id",
    authenticate,
    transportationBookingController.updateBooking
  );

  // AI Itinerary Route
  app.post(
    "/api/generate-itinerary",
    authenticate,
    itineraryController.generateItinerary
  );

  // NEW: Itinerary Day Routes
  app.get(
    "/api/itinerary-days/trip/:tripId",
    authenticate,
    itineraryController.getItineraryDaysByTrip
  );
  app.delete(
    "/api/itinerary-days/trip/:tripId",
    authenticate,
    itineraryController.deleteItineraryDaysByTrip
  );
  app.patch(
    "/api/itinerary-days/trip/:tripId/activities",
    authenticate,
    itineraryController.updateItineraryDayActivities
  );
  app.post(
    "/api/itinerary-days/trip/:tripId/day",
    authenticate,
    itineraryController.addDayToItinerary
  );
  app.delete(
    "/api/itinerary-days/trip/:tripId/day/:dayNumber",
    authenticate,
    itineraryController.removeDayFromItinerary
  );

  // NEW: Save detailed itinerary endpoint
  app.post(
    "/api/save-detailed-itinerary",
    authenticate,
    itineraryController.saveDetailedItinerary
  );

  // app.get("/hotels-by-city/:cityCode", HotelController.getHotelsByCity);

  // // GET: Hotel Search with Availability and Pricing
  // app.get("/hotel-search", HotelController.searchHotels);

  // // GET: Hotel Offers by Hotel ID
  // app.get("/hotel-offers/:hotelId", HotelController.getHotelOffers);

  // // POST: Hotel Offer Confirmation (pricing)
  // app.post("/hotel-confirmation", HotelController.confirmHotelOffer);

  // // POST: Hotel Booking
  // app.post("/hotel-booking", HotelController.createHotelBooking);

  // // GET: Retrieve hotel booking by ID
  // app.get("/hotel-booking/:bookingId", HotelController.getHotelBooking);

  // // DELETE: Cancel hotel booking
  // app.delete("/hotel-booking/:bookingId", HotelController.cancelHotelBooking);

  // // GET: Hotel amenities and facilities
  // app.get("/hotel-amenities", HotelController.getHotelAmenities);

  // // GET: All hotel bookings for a main booking
  // app.get(
  //   "/bookings/:bookingId/hotels",
  //   HotelController.getHotelBookingsByMainBookingId
  // );
  // 1. Search destinations
// GET /api/hotels/search-destinations?query=Mumbai
app.get('/search-destinations', HotelController.searchDestinations);

// 2. Search hotels in a destination
// GET /api/hotels/search?dest_id=-2092174&checkin_date=2025-09-22&checkout_date=2025-09-24&adults=1&room_qty=1
app.get('/search', HotelController.searchHotels);

// 3. Get detailed hotel information
// GET /api/hotels/74717/details?arrival_date=2025-09-22&departure_date=2025-09-24&adults=1
app.get('/:hotel_id/details', HotelController.getHotelDetails);

// 4. Create hotel booking
// POST /api/hotels/bookings
app.post('/bookings', HotelController.createHotelBooking);

// 5. Get hotel booking by reference
// GET /api/hotels/bookings/HB-123456789
app.get('/bookings/:bookingRef', HotelController.getHotelBooking);

// 6. Update hotel booking status
// PUT /api/hotels/bookings/HB-123456789/status
app.put('/bookings/:bookingRef/status', HotelController.updateBookingStatus);

// 7. Get user's hotel bookings
// GET /api/hotels/users/user123/bookings?status=confirmed&page=1&limit=10
app.get('/users/:userId/bookings', HotelController.getUserHotelBookings);


  return createServer(app);
}

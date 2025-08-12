// import { 
//   User, InsertUser, 
//   Destination, InsertDestination,
//   Trip, InsertTrip,
//   TransportationBooking, InsertTransportationBooking
// } from "./shared/schema";
// // import { User } from "../shared/schema";
// // Storage interface for all CRUD operations
// export interface IStorage {
//   // User operations
//   getUser(id: number): Promise<User | undefined>;
//   getUserByUsername(username: string): Promise<User | undefined>;
//   getUserByEmail(email: string): Promise<User | undefined>;
//   createUser(user: InsertUser): Promise<User>;
  
//   // Destination operations
//   getDestinations(): Promise<Destination[]>;
//   getDestination(id: number): Promise<Destination | undefined>;
//   createDestination(destination: InsertDestination): Promise<Destination>;
  
//   // Trip operations
//   getTrips(userId: number): Promise<Trip[]>;
//   getTrip(id: number): Promise<Trip | undefined>;
//   createTrip(trip: InsertTrip): Promise<Trip>;
//   updateTrip(id: number, trip: Partial<Trip>): Promise<Trip | undefined>;
//   deleteTrip(id: number): Promise<boolean>;
  
//   // Transportation bookings
//   getTransportationBookings(userId: number): Promise<TransportationBooking[]>;
//   getTransportationBooking(id: number): Promise<TransportationBooking | undefined>;
//   createTransportationBooking(booking: InsertTransportationBooking): Promise<TransportationBooking>;
//   updateTransportationBooking(id: number, booking: Partial<TransportationBooking>): Promise<TransportationBooking | undefined>;
// }

// // In-memory implementation of the storage interface
// export class MemStorage implements IStorage {
//   private users: Map<number, User>;
//   private destinations: Map<number, Destination>;
//   private trips: Map<number, Trip>;
//   private transportationBookings: Map<number, TransportationBooking>;
  
//   private userId: number;
//   private destinationId: number;
//   private tripId: number;
//   private transportationBookingId: number;

//   constructor() {
//     this.users = new Map();
//     this.destinations = new Map();
//     this.trips = new Map();
//     this.transportationBookings = new Map();
    
//     this.userId = 1;
//     this.destinationId = 1;
//     this.tripId = 1;
//     this.transportationBookingId = 1;
    
//     // Add some initial destinations
//     this.seedDestinations();
//   }

//   private seedDestinations() {
//     const destinations: InsertDestination[] = [
//       {
//         name: "Bali",
//         country: "Indonesia",
//         description: "Experience tropical paradise with rich culture and stunning beaches.",
//         imageUrl: "https://images.unsplash.com/photo-1602642677617-ebbaad01f424?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
//         rating: "4.9",
//         pricePerPerson: 1299,
//         badge: "Most Popular"
//       },
//       {
//         name: "Santorini",
//         country: "Greece",
//         description: "Iconic white buildings, blue domes, and breathtaking sunsets.",
//         imageUrl: "https://images.unsplash.com/photo-1545504645-3e73ca374246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1935&q=80",
//         rating: "4.8",
//         pricePerPerson: 1599,
//         badge: "Hot Deal"
//       },
//       {
//         name: "Kyoto",
//         country: "Japan",
//         description: "Ancient temples, traditional gardens, and cultural experiences.",
//         imageUrl: "https://images.unsplash.com/photo-1580502738358-063dc8a75433?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1935&q=80",
//         rating: "4.7",
//         pricePerPerson: 1899,
//         badge: ""
//       },
//       {
//         name: "Paris",
//         country: "France",
//         description: "The city of love with iconic landmarks and romantic atmosphere.",
//         imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1973&q=80",
//         rating: "4.7",
//         pricePerPerson: 1499,
//         badge: "Romantic"
//       },
//       {
//         name: "New York",
//         country: "USA",
//         description: "The city that never sleeps, with iconic skylines and endless entertainment.",
//         imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
//         rating: "4.6",
//         pricePerPerson: 1799,
//         badge: "Urban Adventure"
//       },
//       {
//         name: "Machu Picchu",
//         country: "Peru",
//         description: "Ancient Incan citadel set high in the Andes Mountains.",
//         imageUrl: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
//         rating: "4.9",
//         pricePerPerson: 1999,
//         badge: "Historical"
//       }
//     ];
    
//     destinations.forEach(destination => {
//       this.createDestination(destination);
//     });
//   }

//   // User operations
//   async getUser(id: number): Promise<User | undefined> {
//     return this.users.get(id);
//   }

//   async getUserByUsername(username: string): Promise<User | undefined> {
//     return Array.from(this.users.values()).find(
//       (user) => user.username === username
//     );
//   }
  
//   async getUserByEmail(email: string): Promise<User | undefined> {
//     return Array.from(this.users.values()).find(
//       (user) => user.email === email
//     );
//   }

//   async createUser(insertUser: InsertUser): Promise<User> {
//     const id = this.userId++;
//     const user: User = { ...insertUser, id };
//     this.users.set(id, user);
//     return user;
//   }

//   // Destination operations
//   async getDestinations(): Promise<Destination[]> {
//     return Array.from(this.destinations.values());
//   }

//   async getDestination(id: number): Promise<Destination | undefined> {
//     return this.destinations.get(id);
//   }

//   async createDestination(insertDestination: InsertDestination): Promise<Destination> {
//     const id = this.destinationId++;
//     const destination: Destination = { 
//       ...insertDestination, 
//       id, 
//       rating: insertDestination.rating ?? null, 
//       pricePerPerson: insertDestination.pricePerPerson ?? null, 
//       badge: insertDestination.badge ?? null 
//     };
//     this.destinations.set(id, destination);
//     return destination;
//   }

//   // Trip operations
//   async getTrips(userId: number): Promise<Trip[]> {
//     return Array.from(this.trips.values()).filter(
//       (trip) => trip.userId === userId
//     );
//   }

//   async getTrip(id: number): Promise<Trip | undefined> {
//     return this.trips.get(id);
//   }

//   async createTrip(insertTrip: InsertTrip): Promise<Trip> {
//     const id = this.tripId++;
//     const trip: Trip = { 
//       ...insertTrip, 
//       id, 
//       itinerary: null, 
//       status: "planned", 
//       children: insertTrip.children ?? null, 
//       preferences: insertTrip.preferences ?? null 
//     };
//     this.trips.set(id, trip);
//     return trip;
//   }

//   async updateTrip(id: number, tripUpdate: Partial<Trip>): Promise<Trip | undefined> {
//     const trip = this.trips.get(id);
//     if (!trip) return undefined;

//     const updatedTrip = { ...trip, ...tripUpdate };
//     this.trips.set(id, updatedTrip);
//     return updatedTrip;
//   }

//   async deleteTrip(id: number): Promise<boolean> {
//     return this.trips.delete(id);
//   }

//   // Transportation bookings
//   async getTransportationBookings(userId: number): Promise<TransportationBooking[]> {
//     return Array.from(this.transportationBookings.values()).filter(
//       (booking) => booking.userId === userId
//     );
//   }

//   async getTransportationBooking(id: number): Promise<TransportationBooking | undefined> {
//     return this.transportationBookings.get(id);
//   }

//   async createTransportationBooking(insertBooking: InsertTransportationBooking): Promise<TransportationBooking> {
//     const id = this.transportationBookingId++;
//     const booking: TransportationBooking = { 
//       ...insertBooking, 
//       id, 
//       status: "booked",
//       driverName: insertBooking.driverName ?? null
//     };
//     this.transportationBookings.set(id, booking);
//     return booking;
//   }

//   async updateTransportationBooking(id: number, bookingUpdate: Partial<TransportationBooking>): Promise<TransportationBooking | undefined> {
//     const booking = this.transportationBookings.get(id);
//     if (!booking) return undefined;

//     const updatedBooking = { ...booking, ...bookingUpdate };
//     this.transportationBookings.set(id, updatedBooking);
//     return updatedBooking;
//   }
// }

// export const storage = new MemStorage();

// src/controllers/SearchResultController.ts
import { Request, Response } from 'express';
import  FlightSearchResult  from '../models/FlightSearchResult';
import  HotelSearchResult  from '../models/HotelSearchResult';
import FlightBooking from '../models/FlightBooking'; // Your existing model
import HotelBooking from '../models/HotelBooking'; // Your existing model
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export class SearchResultController {

  // Save flight search results
  async saveFlightSearchResults(req: Request, res: Response): Promise<void> {
    try {
      const userId= req.session.userId;
  const { tripId, searchParams, resultCount } = req.body;
  console.log("Received flight search results:", { tripId, userId, searchParams, resultCount });


  const searchSessionId = uuidv4();

  // Save just ONE search record with metadata
  const searchResult = new FlightSearchResult({
    userId: new Types.ObjectId(userId),
    tripId: new Types.ObjectId(tripId),
    searchParams: {
        originCode: searchParams.originCode,
        destinationCode: searchParams.destinationCode,
        departureDate: searchParams.departureDate,
        
      },
    searchSessionId,
    resultCount: resultCount || 0,
  });

  await searchResult.save();

  console.log(`Saved flight search for user ${userId}, trip ${tripId}, found ${resultCount} results`);

  res.status(201).json({
    success: true,
    message: "Flight search saved successfully",
    searchSessionId,
    resultCount: resultCount
  });

} catch (error) {
  console.error("Error saving flight search:", error);
  res.status(500).json({
    success: false,
    error: (error as Error).message
  });
}
  }

  // Save hotel search results
  async saveHotelSearchResults(req: Request, res: Response): Promise<void> {
    try {
      const userId= req.session.userId;
      const {
        tripId,
        searchParams,
        hotels
      } = req.body;

      const searchSessionId = uuidv4();

      const searchResults = await Promise.all(
        hotels.map(async (hotel: any) => {
          const searchResult = new HotelSearchResult({
            userId: new Types.ObjectId(userId),
            tripId: new Types.ObjectId(tripId),
            searchParams,

            // hotelData: hotel,
            searchSessionId
          });
          return await searchResult.save();
        })
      );
      console.log(`Saved hotel search for user ${userId}, trip ${tripId}, found ${searchResults.length} results`);


      res.status(201).json({
        success: true,
        message: `Saved ${searchResults.length} hotel search results`,
        searchSessionId,
        count: searchResults.length
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  // Create flight booking from search result
  async createFlightBookingFromSearch(req: Request, res: Response): Promise<void> {
    try {
      const { searchResultId, travelers } = req.body;

      const searchResult = await FlightSearchResult.findById(searchResultId);
      if (!searchResult) {
        res.status(404).json({
          success: false,
          error: 'Flight search result not found'
        });
        return;
      }

      const flight = searchResult.flightData;
      const segment = flight.itineraries[0].segments[0];
      const lastSegment = flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1];

      // Create FlightBooking using your existing model
      const flightBooking = new FlightBooking({
        bookingId: null, // Will be set when parent booking is created
        flightBookingRef: `FL-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        flightdetails: {
          airline: segment.carrierCode,
          flightNumber: segment.number,
          departure: {
            airport: segment.departure.iataCode,
            city: segment.departure.iataCode,
            dateTime: new Date(segment.departure.at),
            terminal: segment.departure.terminal
          },
          arrival: {
            airport: lastSegment.arrival.iataCode,
            city: lastSegment.arrival.iataCode,
            dateTime: new Date(lastSegment.arrival.at),
            terminal: lastSegment.arrival.terminal
          },
          aircraft: segment.aircraft?.code,
          duration: this.parseDuration(flight.itineraries[0].duration),
          class: 'economy'
        },
        passengers: travelers.map((traveler: any) => ({
          travelerId: new Types.ObjectId(traveler.travelerId),
          seatNumber: null,
          mealPreference: null,
          baggageDetails: {
            checkedBags: 1,
            carryOnBags: 1,
            weight: 23
          },
          specialServices: [],
          ticketNumber: null
        })),
        pricing: {
          basePrice: parseFloat(flight.price.base || flight.price.total),
          taxes: 0, // Calculate if needed
          fees: 0,
          totalPrice: parseFloat(flight.price.total),
          currency: flight.price.currency
        },
        status: 'pending'
      });

      await flightBooking.save();

      res.json({
        success: true,
        message: 'Flight booking created from search result',
        flightBooking: {
          id: flightBooking._id,
          flightBookingRef: flightBooking.flightBookingRef,
          pricing: flightBooking.pricing,
          flightDetails: flightBooking.flightdetails
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  // Create hotel booking from search result
  async createHotelBookingFromSearch(req: Request, res: Response): Promise<void> {
    try {
      const { searchResultId, travelers, leadGuestId } = req.body;

      const searchResult = await HotelSearchResult.findById(searchResultId);
      if (!searchResult) {
        res.status(404).json({
          success: false,
          error: 'Hotel search result not found'
        });
        return;
      }

      const hotel = searchResult.hotelData;
      const searchParams = searchResult.searchParams;

      const checkIn = new Date(searchParams.checkinDate);
      const checkOut = new Date(searchParams.checkoutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

      // Create HotelBooking using your existing model structure
      const hotelBooking = new HotelBooking({
        bookingId: null, // Will be set when parent booking is created
        hotelBookingRef: `HT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        apiDetails: {
          hotelId: hotel.hotelId,
          destId: searchParams.destId,
          bookingSource: 'booking.com'
        },
        hotelDetails: {
          hotelId: hotel.hotelId,
          hotelName: hotel.hotelName,
          hotelNameTranslated: hotel.hotelNameTranslated,
          address: {
            street: hotel.address || '',
            city: hotel.city || '',
            country: hotel.country || '',
            zipCode: hotel.zipCode || ''
          },
          coordinates: {
            latitude: hotel.latitude || 0,
            longitude: hotel.longitude || 0
          },
          starRating: hotel.starRating || 0,
          propertyType: 'hotel',
          reviews: {
            score: hotel.reviewScore || 0,
            count: hotel.reviewCount || 0,
            scoreWord: hotel.reviewScoreWord || ''
          }
        },
        stayDetails: {
          checkIn,
          checkOut,
          nights,
          searchParams: {
            adults: searchParams.adults,
            children: searchParams.children,
            roomQuantity: searchParams.rooms
          },
          rooms: [{
            roomType: 'Standard Room',
            occupancy: {
              adults: searchParams.adults,
              children: searchParams.children
            },
            assignedTravelers: travelers.map((traveler: any) => ({
              travelerId: new Types.ObjectId(traveler.travelerId),
              isPrimary: traveler.travelerId === leadGuestId,
              guestType: 'adult'
            }))
          }]
        },
        leadGuest: {
          travelerId: new Types.ObjectId(leadGuestId),
          isPrimaryBooker: true
        },
        pricing: {
          basePrice: Math.round(parseFloat(hotel.priceBreakdown?.grossPrice?.value || hotel.totalPrice || 0) * 0.85),
          taxes: Math.round(parseFloat(hotel.priceBreakdown?.grossPrice?.value || hotel.totalPrice || 0) * 0.15),
          fees: 0,
          totalPrice: Math.round(parseFloat(hotel.priceBreakdown?.grossPrice?.value || hotel.totalPrice || 0)),
          currency: hotel.currency || 'INR'
        },
        status: 'pending'
      });

      await hotelBooking.save();

      res.json({
        success: true,
        message: 'Hotel booking created from search result',
        hotelBooking: {
          id: hotelBooking._id,
          hotelBookingRef: hotelBooking.hotelBookingRef,
          pricing: hotelBooking.pricing,
          hotelDetails: hotelBooking.hotelDetails,
          stayDetails: {
            checkIn: hotelBooking.stayDetails.checkIn,
            checkOut: hotelBooking.stayDetails.checkOut,
            nights: hotelBooking.stayDetails.nights
          }
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  // Get pending bookings for consolidated booking creation
  async getPendingBookingsForTrip(req: Request, res: Response): Promise<void> {
    try {
      const { tripId, userId } = req.params;

      const [flightBookings, hotelBookings] = await Promise.all([
        FlightBooking.find({ 
          bookingId: null, // Not yet linked to parent booking
          status: 'pending'
        }).sort({ createdAt: -1 }),
        HotelBooking.find({ 
          bookingId: null,
          status: 'pending' 
        }).sort({ createdAt: -1 })
      ]);

      res.json({
        success: true,
        pendingBookings: {
          flights: flightBookings,
          hotels: hotelBookings
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  // Helper method to parse flight duration
  private parseDuration(duration: string): number {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return 0;
    
    const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
    const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
    
    return hours * 60 + minutes; // Return duration in minutes
  }
}
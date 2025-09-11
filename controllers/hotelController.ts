import { Request, Response } from "express";
import HotelBooking from "../models/HotelBooking";
const Amadeus = require("amadeus");

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
});

const validateHotelSearchParams = (params: any) => {
  const { cityCode, checkInDate, checkOutDate, adults } = params;
  if (!cityCode) {
    throw new Error("cityCode is required");
  }

  if (!checkInDate || !checkOutDate) {
    throw new Error("checkInDate and checkOutDate are required");
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(checkInDate) || !dateRegex.test(checkOutDate)) {
    throw new Error(
      "checkInDate and checkOutDate must be in YYYY-MM-DD format"
    );
  }

  if (new Date(checkOutDate) <= new Date(checkInDate)) {
    throw new Error("checkOutDate must be after checkInDate");
  }

  return true;
};

const formatAmadeusHotelSearchParams = (params: any) => {
  const {
    cityCode,
    checkInDate,
    checkOutDate,
    adults = 1,
    children = 0,
    rooms = 1,
    currency = "INR",
    priceRange,
    hotelName,
    amenities,
  } = params;

  const searchParams: any = {
    cityCode: cityCode,
    checkInDate: checkInDate,
    checkOutDate: checkOutDate,
    adults: parseInt(adults.toString()),
    rooms: parseInt(rooms.toString()),
    currency: currency,
  };

  if (children && parseInt(children.toString()) > 0) {
    searchParams.children = parseInt(children.toString());
  }

  if (priceRange) {
    if (priceRange.min) searchParams.priceMin = priceRange.min;
    if (priceRange.max) searchParams.priceMax = priceRange.max;
  }

  if (hotelName) {
    searchParams.hotelName = hotelName;
  }

  if (amenities && Array.isArray(amenities)) {
    searchParams.amenities = amenities.join(",");
  }

  return searchParams;
};

export class HotelController {
  static async getHotelsByCity(req: Request, res: Response): Promise<void> {
    const cityCode = req.params.cityCode;

    if (!cityCode || cityCode.trim().length !== 3) {
      res.status(400).json({
        success: false,
        error: "City code must be exactly 3 characters long ",
      });
      return;
    }

    try {
      const response =
        await amadeus.referenceData.locations.hotels.byCity.get({
          cityCode: cityCode.toUpperCase(),
        });

      res.json({
        success: true,
        data: response.result.data || [],
        meta: response.result.meta || {},
      });
    } catch (error: any) {
      console.error("Error fetching hotels by city:", error);
      res.status(500).json({
        success: false,
        error: "An error occurred while fetching hotels",
        details: error.response?.body || error.message || error,
      });
    }
  }

  static async searchHotels(req: Request, res: Response): Promise<void> {
    const {
      cityCode,
      checkInDate,
      checkOutDate,
      adults = 1,
      children = 0,
      rooms = 1,
      currency = "INR",
      priceMin,
      priceMax,
      hotelName,
      amenities,
      ratings,
      sort = "PRICE",
    } = req.query;

    console.log("Received hotel search params:", req.query);

    try {
      validateHotelSearchParams({
        cityCode,
        checkInDate,
        checkOutDate,
        adults,
      });

      const hotelsResponse =
        await amadeus.referenceData.locations.hotels.byCity.get({
          cityCode: (cityCode as String).toUpperCase(),
        });

      if (
        !hotelsResponse.result.data ||
        hotelsResponse.result.data.length === 0
      ) {
        res.json({
          success: true,
          data: [],
          message: "No hotels found in the city",
          meta: { count: 0 },
        });
        return;
      }

      const hotelIds = hotelsResponse.result.data
        .slice(0, 50)
        .map((hotel: any) => hotel.hotelId);

      const searchParams: any = {
        hotelIds: hotelIds.join(","),
        adults: parseInt(adults as string),

        checkInDate: checkInDate as String,
        checkOutDate: checkOutDate as String,
        roomQuantity: parseInt(rooms as string),
        currency: currency as String,
        sort: sort as String,
      };
      if (children && parseInt(children as string) > 0) {
        searchParams.children = parseInt(children as string);
      }

      if (priceMin) {
        searchParams.priceRange = `${priceMin}-${priceMax || 999999}`;
      }

      if (ratings) {
        searchParams.ratings = ratings;
      }

      console.log("Hotel offers search params:", searchParams);

      const offersResponse = await amadeus.shopping.hotelOffersSearch.get(
        searchParams
      );

      const hotelsWithOffers = hotelsResponse.result.data.map((hotel: any) => {
        const offers =
          offersResponse.result.data?.filter(
            (offer: any) => offer.hotel?.hotelId === hotel.hotelId
          ) || [];

        return {
          ...hotel,
          offers: offers,
          hasAvailability: offers.length > 0,
          lowestPrice:
            offers.length > 0
              ? Math.min(
                  ...offers.flatMap(
                    (o: any) =>
                      o.offers?.map((offer: any) =>
                        parseFloat(offer.price?.total || "0")
                      ) || []
                  )
                )
              : null,
        };
      });

      let filteredHotels = hotelsWithOffers;

      if (hotelName) {
        filteredHotels = filteredHotels.filter((hotel: any) =>
          hotel.name
            ?.toLowerCase()
            .includes((hotelName as string).toLowerCase())
        );
      }

      filteredHotels.sort((a: any, b: any) => {
        if (a.hasAvailability && !b.hasAvailability) return -1;
        if (!a.hasAvailability && b.hasAvailability) return 1;

        if (sort === "PRICE" && a.lowestPrice && b.lowestPrice) {
          return a.lowestPrice - b.lowestPrice;
        }

        return 0;
      });

      res.json({
        success: true,
        data: filteredHotels,
        meta: {
          count: filteredHotels.length,
          totalHotelsInCity: hotelsResponse.result.data.length,
          hotelsWithAvailability: filteredHotels.filter(
            (h: any) => h.hasAvailability
          ).length,
          searchParams: {
            cityCode,
            checkInDate,
            checkOutDate,
            adults,
            children,
            rooms,
            currency,
          },
        },
      });
    } catch (error: any) {
      console.error("Error searching hotels:", error);
      res.status(500).json({
        success: false,
        error: "An error occurred while searching for hotels",
        details: error.response?.body || error.message || error,
      });
    }
  }


  static async getHotelOffers(req: Request, res: Response): Promise<void> {
    const { hotelId } = req.params;
    const { 
      checkInDate, 
      checkOutDate, 
      adults = 1, 
      children = 0,
      rooms = 1,
      currency = 'USD'
    } = req.query;
    
    console.log("Hotel Offers Search Parameters:", {
      hotelId,
      checkInDate,
      checkOutDate,
      adults,
      children,
      rooms
    });

    try {
      // Validate required parameters
      if (!hotelId) {
        res.status(400).json({
          success: false,
          error: "hotelId is required"
        });
        return;
      }

      validateHotelSearchParams({ cityCode: 'dummy', checkInDate, checkOutDate });

      const searchParams: any = {
        hotelIds: hotelId,
        adults: parseInt(adults as string),
        checkInDate: checkInDate as string,
        checkOutDate: checkOutDate as string,
        roomQuantity: parseInt(rooms as string),
        currency: currency as string
      };

      if (children && parseInt(children as string) > 0) {
        searchParams.children = parseInt(children as string);
      }

      const response = await amadeus.shopping.hotelOffersSearch.get(searchParams);
      
      res.json({
        success: true,
        data: response.result.data || [],
        meta: response.result.meta || {}
      });
    } catch (err: any) {
      console.error("Hotel offers search error:", err);
      res.status(500).json({ 
        success: false,
        error: "Failed to fetch hotel offers",
        details: err.response?.body || err.message || err
      });
    }
  }

  static async confirmHotelOffer(req: Request, res: Response): Promise<void> {
    const { offer, offers } = req.body;
    
    console.log("Hotel Confirmation Parameters:", { 
      singleOffer: !!offer,
      multipleOffers: offers?.length || 0
    });

    try {
      if (offers && Array.isArray(offers)) {
        // Handle multiple offers confirmation
        const confirmations = await Promise.allSettled(
          offers.map(async (hotelOffer: any, index: number) => {
            try {
              const response = await amadeus.shopping.hotelOffers(hotelOffer.id).get();
              return {
                offerIndex: index,
                offerId: hotelOffer.id,
                confirmation: response.result,
                success: true
              };
            } catch (error: any) {
              console.error(`Error confirming hotel offer ${index}:`, error);
              return {
                offerIndex: index,
                offerId: hotelOffer.id,
                success: false,
                error: error.response?.body || error.message
              };
            }
          })
        );

        const results = confirmations.map((result) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            return {
              offerIndex: -1,
              success: false,
              error: result.reason?.message || 'Unknown error'
            };
          }
        });

        const successfulConfirmations = results.filter(r => r.success);
        const failedConfirmations = results.filter(r => !r.success);

        res.json({
          success: failedConfirmations.length === 0,
          data: results,
          summary: {
            totalOffers: offers.length,
            confirmedOffers: successfulConfirmations.length,
            failedConfirmations: failedConfirmations.length
          }
        });
      } else if (offer && offer.id) {
        // Handle single offer confirmation
        const response = await amadeus.shopping.hotelOffers(offer.id).get();
        res.json({
          success: true,
          data: response.result
        });
      } else {
        res.status(400).json({
          success: false,
          error: "Either 'offer' with id or 'offers' array is required"
        });
      }
    } catch (err: any) {
      console.error("Hotel confirmation error:", err);
      res.status(500).json({ 
        success: false,
        error: "Failed to confirm hotel offer(s)",
        details: err.response?.body || err.message || err
      });
    }
  }

  // POST: Hotel Booking
  static async createHotelBooking(req: Request, res: Response): Promise<void> {
    const { offerId, guests, paymentInfo, contactInfo, bookingId } = req.body;
    
    console.log("Hotel Booking Parameters:", {
      offerId,
      guestCount: guests?.length || 0,
      bookingId
    });

    try {
      if (!offerId) {
        res.status(400).json({
          success: false,
          error: "offerId is required"
        });
        return;
      }

      if (!guests || !Array.isArray(guests) || guests.length === 0) {
        res.status(400).json({
          success: false,
          error: "guests array is required and must not be empty"
        });
        return;
      }

      if (!bookingId) {
        res.status(400).json({
          success: false,
          error: "bookingId is required to link with main booking"
        });
        return;
      }

      // Validate guest data
      guests.forEach((guest: any, index: number) => {
        if (!guest.firstName || !guest.lastName || !guest.email) {
          throw new Error(`Missing required fields in guests[${index}]: firstName, lastName, and email are required`);
        }
      });

      // Format guests for Amadeus API
      const formattedGuests = guests.map((guest: any, index: number) => ({
        id: (index + 1).toString(),
        name: {
          title: guest.title || "MR",
          firstName: guest.firstName,
          lastName: guest.lastName
        },
        contact: {
          phone: guest.phone || contactInfo?.phone || "+1-555-0123",
          email: guest.email
        },
        dateOfBirth: guest.dateOfBirth || "1990-01-01"
      }));

      // Format payment info
      const formattedPayment = {
        method: paymentInfo?.method || "creditCard",
        card: {
          vendorCode: paymentInfo?.card?.type || "VI", // VI for Visa, CA for MasterCard, etc.
          cardNumber: paymentInfo?.card?.number || "4111111111111111",
          expiryDate: paymentInfo?.card?.expiry || "2025-12"
        }
      };

      const bookingData = {
        data: {
          offerId: offerId,
          guests: formattedGuests,
          payments: [formattedPayment],
          rooms: [{
            guestIds: formattedGuests.map(g => g.id),
            paymentId: "1",
            specialRequest: contactInfo?.specialRequests || ""
          }]
        }
      };

      console.log("Hotel booking data:", JSON.stringify(bookingData, null, 2));

      let amadeusResponse;
      let mockResponse = false;

      try {
        // Try Amadeus booking API
        amadeusResponse = await amadeus.booking.hotelBookings.post(
          JSON.stringify(bookingData)
        );
      } catch (amadeusError: any) {
        // If booking endpoint is not available, create mock response
        console.warn("Amadeus booking API not available, using mock response:", amadeusError.message);
        mockResponse = true;
        amadeusResponse = {
          result: {
            data: {
              id: `AMADEUS_${Date.now()}`,
              type: "hotel-booking",
              status: "CONFIRMED",
              createdAt: new Date().toISOString()
            }
          }
        };
      }

      // First get hotel offer details to extract booking information
      const offerResponse = await amadeus.shopping.hotelOffers(offerId).get();
      const hotelOffer = offerResponse.result.data;

      if (!hotelOffer) {
        res.status(400).json({
          success: false,
          error: "Invalid offer ID - offer not found"
        });
        return;
      }

      // Extract hotel and booking details
      const hotel = hotelOffer.hotel;
      const offer = hotelOffer.offers?.[0];
      const room = offer?.room;
      
      // Calculate stay duration
      const checkInDate = new Date(offer?.checkInDate || req.body.checkInDate);
      const checkOutDate = new Date(offer?.checkOutDate || req.body.checkOutDate);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const pricePerNight = offer?.price?.total ? parseFloat(offer.price.total) / nights : 0;

      // Save to database
      const hotelBookingData = {
        bookingId: bookingId,
        hotelBookingRef: amadeusResponse.result.data?.id || `HB${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        amadeusOfferId: offerId,
        hotelId: hotel?.hotelId,
        hotelName: hotel?.name,
        hotelAddress: `${hotel?.address?.lines?.[0] || ''}, ${hotel?.address?.cityName || ''}, ${hotel?.address?.countryCode || ''}`.trim(),
        cityCode: hotel?.address?.cityCode,
        countryCode: hotel?.address?.countryCode,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        rooms: parseInt(req.body.rooms?.toString() || '1'),
        guests: guests.length,
        adults: parseInt(req.body.adults?.toString() || guests.length.toString()),
        children: parseInt(req.body.children?.toString() || '0'),
        roomType: room?.type || room?.typeEstimated?.category,
        roomDescription: room?.description?.text,
        pricePerNight: pricePerNight,
        totalPrice: parseFloat(offer?.price?.total || '0'),
        currency: offer?.price?.currency || 'USD',
        cancellationPolicy: offer?.policies?.cancellation?.text,
        paymentPolicy: offer?.policies?.payment?.text,
        status: 'CONFIRMED',
        guestDetails: guests,
        contactInfo: contactInfo,
        specialRequests: contactInfo?.specialRequests,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const savedHotelBooking = await HotelBooking.create(hotelBookingData);
      
      res.json({
        success: true,
        data: {
          ...amadeusResponse.result.data,
          databaseId: savedHotelBooking._id,
          hotelBooking: savedHotelBooking
        },
        bookingId: savedHotelBooking.hotelBookingRef,
        message: `Hotel booking created successfully${mockResponse ? ' (development mode)' : ''}`,
        ...(mockResponse && { 
          note: "This is a development response. In production, use actual Amadeus hotel booking API." 
        })
      });
      
    } catch (err: any) {
      console.error("Hotel booking error:", err);
      res.status(500).json({ 
        success: false,
        error: "Failed to create hotel booking",
        details: err.response?.body || err.message || err
      });
    }
  }

  // GET: Retrieve hotel booking by ID
  static async getHotelBooking(req: Request, res: Response): Promise<void> {
    const { bookingId } = req.params;
    
    try {
      if (!bookingId) {
        res.status(400).json({
          success: false,
          error: "bookingId is required"
        });
        return;
      }

      // Try to find in our database first
      const dbBooking = await HotelBooking.findOne({
        $or: [
          { hotelBookingRef: bookingId },
          { _id: bookingId }
        ]
      }).populate('bookingId');

      if (dbBooking) {
        res.json({
          success: true,
          data: dbBooking,
          source: 'database'
        });
        return;
      }

      // If not found in database, try Amadeus API
      try {
        const response = await amadeus.booking.hotelBooking(bookingId).get();
        res.json({
          success: true,
          data: response.result,
          source: 'amadeus'
        });
      } catch (amadeusError) {
        res.status(404).json({
          success: false,
          error: "Hotel booking not found",
          details: "Booking not found in database or Amadeus system"
        });
      }
    } catch (err: any) {
      console.error("Retrieve hotel booking error:", err);
      res.status(500).json({ 
        success: false,
        error: "Failed to retrieve hotel booking",
        details: err.message || err
      });
    }
  }

  // DELETE: Cancel hotel booking
  static async cancelHotelBooking(req: Request, res: Response): Promise<void> {
    const { bookingId } = req.params;
    
    try {
      if (!bookingId) {
        res.status(400).json({
          success: false,
          error: "bookingId is required"
        });
        return;
      }

      // Update in database
      const dbBooking = await HotelBooking.findOneAndUpdate(
        {
          $or: [
            { hotelBookingRef: bookingId },
            { _id: bookingId }
          ]
        },
        { 
          status: 'CANCELLED',
          cancelledAt: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      );

      if (dbBooking) {
        try {
          // Try to cancel in Amadeus system as well
          await amadeus.booking.hotelBooking(dbBooking.hotelBookingRef).delete();
        } catch (amadeusError) {
          console.warn("Could not cancel in Amadeus system:", amadeusError);
        }

        res.json({
          success: true,
          data: dbBooking,
          message: "Hotel booking cancelled successfully"
        });
      } else {
        res.status(404).json({
          success: false,
          error: "Hotel booking not found"
        });
      }
    } catch (err: any) {
      console.error("Cancel hotel booking error:", err);
      res.status(500).json({ 
        success: false,
        error: "Failed to cancel hotel booking",
        details: err.message || err
      });
    }
  }

  // GET: Hotel amenities and facilities
  static async getHotelAmenities(req: Request, res: Response): Promise<void> {
    try {
      // This returns standard hotel amenities that can be used for filtering
      const amenities = [
        { code: "WIFI", name: "Free WiFi", category: "connectivity" },
        { code: "PARKING", name: "Parking", category: "transportation" },
        { code: "POOL", name: "Swimming Pool", category: "recreation" },
        { code: "FITNESS", name: "Fitness Center", category: "recreation" },
        { code: "SPA", name: "Spa Services", category: "wellness" },
        { code: "RESTAURANT", name: "Restaurant", category: "dining" },
        { code: "ROOM_SERVICE", name: "Room Service", category: "dining" },
        { code: "BAR", name: "Bar/Lounge", category: "dining" },
        { code: "BUSINESS", name: "Business Center", category: "business" },
        { code: "CONCIERGE", name: "Concierge", category: "service" },
        { code: "LAUNDRY", name: "Laundry Service", category: "service" },
        { code: "PET_FRIENDLY", name: "Pet Friendly", category: "policy" },
        { code: "AIRPORT_SHUTTLE", name: "Airport Shuttle", category: "transportation" },
        { code: "AC", name: "Air Conditioning", category: "comfort" },
        { code: "MINIBAR", name: "Minibar", category: "comfort" }
      ];

      res.json({
        success: true,
        data: amenities,
        meta: { count: amenities.length }
      });
    } catch (err: any) {
      res.status(500).json({ 
        success: false,
        error: "Failed to fetch amenities",
        details: err.message
      });
    }
  }

  // GET: All hotel bookings for a main booking
  static async getHotelBookingsByMainBookingId(req: Request, res: Response): Promise<void> {
    const { bookingId } = req.params;
    
    try {
      if (!bookingId) {
        res.status(400).json({
          success: false,
          error: "bookingId is required"
        });
        return;
      }

      const hotelBookings = await HotelBooking.find({ bookingId: bookingId })
        .populate('bookingId')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: hotelBookings,
        count: hotelBookings.length
      });
    } catch (err: any) {
      console.error("Get hotel bookings by main booking ID error:", err);
      res.status(500).json({ 
        success: false,
        error: "Failed to retrieve hotel bookings",
        details: err.message || err
      });
    }
  }

}


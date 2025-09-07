
import { Router, Request, Response } from "express";
const router = Router();
const Amadeus = require('amadeus');

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID || "missing-client-id",
  clientSecret: process.env.AMADEUS_CLIENT_SECRET || "missing-client-secret",
});

// Helper function to validate request parameters
const validateFlightSearchParams = (params: any) => {
  const { originCode, destinationCode, dateOfDeparture } = params;
  
  if (!originCode || !destinationCode || !dateOfDeparture) {
    throw new Error('Missing required parameters: originCode, destinationCode, and dateOfDeparture are required');
  }
  
  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateOfDeparture)) {
    throw new Error('Invalid date format. Use YYYY-MM-DD format');
  }
  
  return true;
};

// Helper function to format search parameters for Amadeus API
const formatAmadeusSearchParams = (params: any) => {
  const { originCode, destinationCode, dateOfDeparture, adults = '1', children = '0', max = '10' } = params;
  
  const searchParams: any = {
    originLocationCode: originCode,
    destinationLocationCode: destinationCode,
    departureDate: dateOfDeparture,
    adults: adults.toString(),
    max: max.toString(),
  };

  // Add children if specified
  if (children && parseInt(children.toString()) > 0) {
    searchParams.children = children.toString();
  }

  return searchParams;
};

// GET: City and Airport Search
router.get("/city-and-airport-search/:parameter", async (req: Request, res: Response): Promise<void> => {
  const parameter = req.params.parameter;
  
  if (!parameter || parameter.trim().length < 2) {
    res.status(400).json({ 
      error: "Parameter must be at least 2 characters long" 
    });
    return;
  }

  try {
    const response = await amadeus.referenceData.locations.get({
      keyword: parameter.trim(),
      subType: Amadeus.location.any,
      page: {
        limit: 10,
        offset: 0
      }
    });

    res.json({
      success: true,
      data: response.result.data || [],
      meta: response.result.meta || {}
    });
  } catch (err: any) {
    console.error("City and airport search error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to search locations",
      details: err.response?.body || err.message || err
    });
  }
});

// GET: Single Flight Search (existing)
router.get("/flight-search", async (req: Request, res: Response) => {
  const { originCode, destinationCode, dateOfDeparture, returnDate, adults = '1', children = '0', max = '10', currencyCode = 'USD' } = req.query;
  
  console.log("Flight Search Parameters:", {
    originCode,
    destinationCode,
    dateOfDeparture,
    returnDate,
    adults,
    children,
  });

  try {
    // Validate required parameters
    validateFlightSearchParams({ originCode, destinationCode, dateOfDeparture });

    const searchParams = formatAmadeusSearchParams({
      originCode,
      destinationCode,
      dateOfDeparture,
      adults,
      children,
      max
    });

    // Add return date for round trip
    if (returnDate && returnDate !== dateOfDeparture) {
      searchParams.returnDate = returnDate;
    }

    // Add currency
    searchParams.currencyCode = currencyCode;

    console.log("Formatted search params:", searchParams);

    const response = await amadeus.shopping.flightOffersSearch.get(searchParams);
    
    res.json({
      success: true,
      data: response.result.data || [],
      meta: response.result.meta || {},
      dictionaries: response.result.dictionaries || {}
    });
  } catch (err: any) {
    console.error("Flight search error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to search flights",
      details: err.response?.body || err.message || err
    });
  }
});

// GET: Multi-City Flight Search (new endpoint for individual segments)
router.get("/multi-city-search", async (req: Request, res: Response) => {
  const { originCode, destinationCode, dateOfDeparture, adults = '1', children = '0', max = '10', currencyCode = 'USD' } = req.query;
  
  console.log("Multi-City Flight Search Parameters:", {
    originCode,
    destinationCode,
    dateOfDeparture,
    adults,
    children,
  });

  try {
    // Validate required parameters
    validateFlightSearchParams({ originCode, destinationCode, dateOfDeparture });

    const searchParams = formatAmadeusSearchParams({
      originCode,
      destinationCode,
      dateOfDeparture,
      adults,
      children,
      max
    });

    // Add currency
    searchParams.currencyCode = currencyCode;

    console.log("Multi-city search params:", searchParams);

    const response = await amadeus.shopping.flightOffersSearch.get(searchParams);
    
    res.json({
      success: true,
      data: response.result.data || [],
      meta: response.result.meta || {},
      dictionaries: response.result.dictionaries || {},
      segment: {
        origin: originCode,
        destination: destinationCode,
        date: dateOfDeparture
      }
    });
  } catch (err: any) {
    console.error("Multi-city flight search error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to search multi-city flights",
      details: err.response?.body || err.message || err
    });
  }
});

// POST: Multi-City Flight Search (for complex itineraries with multiple segments)
router.post("/multi-city-search", async (req: Request, res: Response) => {
  const { originDestinations, travelers = [], currencyCode = 'USD', maxFlightOffers = 10 } = req.body;
  
  console.log("Multi-City Flight Search (POST) Parameters:", {
    originDestinations: originDestinations?.length || 0,
    travelers: travelers?.length || 0,
  });

  try {
    if (!originDestinations || !Array.isArray(originDestinations) || originDestinations.length === 0) {
       res.status(400).json({
        success: false,
        error: "originDestinations array is required and must not be empty"
      });
    }

    // Validate each origin destination
    originDestinations.forEach((od: any, index: number) => {
      if (!od.originCode || !od.destinationCode || !od.date) {
        throw new Error(`Missing required fields in originDestinations[${index}]: originCode, destinationCode, and date are required`);
      }
    });

    // Format originDestinations for Amadeus API
    const formattedOriginDestinations = originDestinations.map((od: any, index: number) => ({
      id: (index + 1).toString(),
      originLocationCode: od.originCode,
      destinationLocationCode: od.destinationCode,
      departureDateTimeRange: {
        date: od.date,
        time: od.time || "10:00:00"
      }
    }));

    // Format travelers
    const formattedTravelers = travelers.length > 0 ? travelers.map((traveler: any, index: number) => ({
      id: (index + 1).toString(),
      travelerType: traveler.type || "ADULT",
      associatedAdultId: traveler.associatedAdultId || undefined
    })) : [{ id: "1", travelerType: "ADULT" }];

    const searchParams = {
      currencyCode,
      originDestinations: formattedOriginDestinations,
      travelers: formattedTravelers,
      sources: ["GDS"],
      searchCriteria: {
        maxFlightOffers,
        flightFilters: {
          cabinRestrictions: [{
            cabin: "ECONOMY",
            coverage: "MOST_SEGMENTS",
            originDestinationIds: formattedOriginDestinations.map((od: any) => od.id)
          }]
        }
      }
    };

    console.log("Complex multi-city search params:", JSON.stringify(searchParams, null, 2));

    const response = await amadeus.shopping.flightOffersSearch.post(
      JSON.stringify(searchParams)
    );
    
    res.json({
      success: true,
      data: response.result.data || [],
      meta: response.result.meta || {},
      dictionaries: response.result.dictionaries || {}
    });
  } catch (err: any) {
    console.error("Multi-city flight search (POST) error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to search complex multi-city flights",
      details: err.response?.body || err.message || err
    });
  }
});

// GET: Multi-City Flight Combinations (finds connecting flights automatically)
router.post("/multi-city-combinations", async (req: Request, res: Response) => {
  const { segments, travelers } = req.body;
  
  console.log("Multi-City Flight Combinations Parameters:", {
    segments: segments?.length || 0,
    travelers,
  });

  try {
    if (!segments || !Array.isArray(segments) || segments.length === 0) {
       res.status(400).json({
        success: false,
        error: "segments array is required and must not be empty"
      });
    }

    // Search flights for each segment individually
    const flightResults = await Promise.allSettled(
      segments.map(async (segment: any, index: number) => {
        try {
          // Validate segment
          if (!segment.originCode || !segment.destinationCode || !segment.date) {
            throw new Error(`Missing required fields in segment ${index}`);
          }

          const searchParams = formatAmadeusSearchParams({
            originCode: segment.originCode,
            destinationCode: segment.destinationCode,
            dateOfDeparture: segment.date,
            adults: travelers?.adults?.toString() || '1',
            children: travelers?.children?.toString() || '0',
            max: '5', // Limit results per segment
          });

          const response = await amadeus.shopping.flightOffersSearch.get(searchParams);
          
          return {
            segmentIndex: index,
            segment: segment,
            flights: response.result.data || [],
            success: true
          };
        } catch (error: any) {
          console.error(`Error searching flights for segment ${index}:`, error);
          return {
            segmentIndex: index,
            segment: segment,
            flights: [],
            success: false,
            error: error.message
          };
        }
      })
    );

    // Process results
    const results = flightResults.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          segmentIndex: -1,
          segment: null,
          flights: [],
          success: false,
          error: result.reason?.message || 'Unknown error'
        };
      }
    });

    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);

    res.json({
      success: true,
      data: results,
      summary: {
        totalSegments: segments.length,
        successfulSegments: successfulResults.length,
        failedSegments: failedResults.length,
        totalFlights: successfulResults.reduce((sum, r) => sum + r.flights.length, 0)
      }
    });
  } catch (err: any) {
    console.error("Multi-city flight combinations error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to search flight combinations",
      details: err.message || err
    });
  }
});

// POST: Flight Confirmation (enhanced for multi-city)
router.post("/flight-confirmation", async (req: Request, res: Response) => {
  const { flight, flights } = req.body; // Support both single and multiple flights
  
  console.log("Flight Confirmation Parameters:", { 
    singleFlight: !!flight,
    multipleFlights: flights?.length || 0
  });

  try {
    if (flights && Array.isArray(flights)) {
      // Handle multiple flights confirmation
      const confirmations = await Promise.allSettled(
        flights.map(async (flightOffer: any, index: number) => {
          try {
            const response = await amadeus.shopping.flightOffers.pricing.post(
              JSON.stringify({
                data: {
                  type: "flight-offers-pricing",
                  flightOffers: [flightOffer],
                },
              })
            );
            return {
              segmentIndex: index,
              flightId: flightOffer.id,
              confirmation: response.result,
              success: true
            };
          } catch (error: any) {
            console.error(`Error confirming flight ${index}:`, error);
            return {
              segmentIndex: index,
              flightId: flightOffer.id,
              success: false,
              error: error.response?.body || error.message
            };
          }
        })
      );

      // Process confirmation results
      const results = confirmations.map((result) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            segmentIndex: -1,
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
          totalFlights: flights.length,
          confirmedFlights: successfulConfirmations.length,
          failedConfirmations: failedConfirmations.length
        }
      });
    } else if (flight) {
      // Handle single flight confirmation (backward compatibility)
      const response = await amadeus.shopping.flightOffers.pricing.post(
        JSON.stringify({
          data: {
            type: "flight-offers-pricing",
            flightOffers: [flight],
          },
        })
      );
      res.json({
        success: true,
        data: response.result
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Either 'flight' or 'flights' parameter is required"
      });
    }
  } catch (err: any) {
    console.error("Flight confirmation error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to confirm flight(s)",
      details: err.response?.body || err.message || err
    });
  }
});

// POST: Multi-City Flight Booking
router.post("/multi-city-booking", async (req: Request, res: Response) => {
  const { flights, travelers } = req.body;
  
  console.log("Multi-City Flight Booking Parameters:", {
    flightCount: flights?.length || 0,
    travelerCount: travelers?.length || 0
  });

  try {
    if (!flights || !Array.isArray(flights) || flights.length === 0) {
      res.status(400).json({
        success: false,
        error: "flights array is required and must not be empty"
      });
    }

    if (!travelers || !Array.isArray(travelers) || travelers.length === 0) {
       res.status(400).json({
        success: false,
        error: "travelers array is required and must not be empty"
      });
    }

    // Validate travelers data
    travelers.forEach((traveler: any, index: number) => {
      if (!traveler.firstName || !traveler.lastName || !traveler.email) {
        throw new Error(`Missing required fields in travelers[${index}]: firstName, lastName, and email are required`);
      }
    });

    // Book each flight segment
    const bookings = await Promise.allSettled(
      flights.map(async (flight: any, index: number) => {
        try {
          // Format travelers for this booking
          const formattedTravelers = travelers.map((traveler: any, tIndex: number) => ({
            id: (tIndex + 1).toString(),
            dateOfBirth: traveler.dateOfBirth || "1990-01-01",
            name: {
              firstName: traveler.firstName,
              lastName: traveler.lastName,
            },
            gender: traveler.gender || "MALE",
            contact: {
              emailAddress: traveler.email,
              phones: [{
                deviceType: "MOBILE",
                countryCallingCode: traveler.countryCode || "1",
                number: traveler.phone || "1234567890",
              }],
            },
            documents: [{
              documentType: "PASSPORT",
              birthPlace: traveler.birthPlace || "Unknown",
              issuanceLocation: traveler.passportIssuanceLocation || "Unknown",
              issuanceDate: traveler.passportIssuanceDate || "2020-01-01",
              number: traveler.passportNumber || "00000000",
              expiryDate: traveler.passportExpiryDate || "2030-01-01",
              issuanceCountry: traveler.passportCountry || "US",
              validityCountry: traveler.passportCountry || "US",
              nationality: traveler.nationality || "US",
              holder: true,
            }],
          }));

          const bookingData = {
            data: {
              type: "flight-order",
              flightOffers: [flight],
              travelers: formattedTravelers,
              remarks: {
                general: [{
                  subType: "GENERAL_MISCELLANEOUS",
                  text: `Multi-city booking segment ${index + 1}`
                }]
              },
              ticketingAgreement: {
                option: "DELAY_TO_CANCEL",
                delay: "6D"
              },
              contacts: [{
                addresseeName: {
                  firstName: travelers[0].firstName,
                  lastName: travelers[0].lastName
                },
                companyName: "Travel Booking Platform",
                purpose: "STANDARD",
                phones: [{
                  deviceType: "MOBILE",
                  countryCallingCode: travelers[0].countryCode || "1",
                  number: travelers[0].phone || "1234567890"
                }],
                emailAddress: travelers[0].email
              }]
            },
          };

          console.log(`Booking flight segment ${index + 1}:`, flight.id);

          const response = await amadeus.booking.flightOrders.post(
            JSON.stringify(bookingData)
          );

          return {
            segmentIndex: index,
            flightId: flight.id,
            bookingId: response.result.data?.id,
            success: true,
            booking: response.result,
            travelers: formattedTravelers.length
          };
        } catch (error: any) {
          console.error(`Error booking flight segment ${index}:`, error);
          return {
            segmentIndex: index,
            flightId: flight.id,
            success: false,
            error: error.response?.body || error.message
          };
        }
      })
    );

    // Process booking results
    const results = bookings.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          segmentIndex: -1,
          success: false,
          error: result.reason?.message || 'Unknown error'
        };
      }
    });

    const successfulBookings = results.filter(r => r.success);
    const failedBookings = results.filter(r => !r.success);

    res.json({
      success: failedBookings.length === 0,
      totalSegments: flights.length,
      successfulBookings: successfulBookings.length,
      failedBookings: failedBookings.length,
      bookings: results,
      bookingIds: successfulBookings.map(b => b.bookingId).filter(Boolean),
      message: failedBookings.length === 0 
        ? `Successfully booked all ${flights.length} flight segments`
        : `Booked ${successfulBookings.length} out of ${flights.length} flight segments`
    });

  } catch (err: any) {
    console.error("Multi-city flight booking error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to process multi-city flight booking",
      details: err.response?.body || err.message || err
    });
  }
});

// POST: Flight Booking (enhanced for backward compatibility)
router.post("/flight-booking", async (req: Request, res: Response) => {
  const { flight, flights, name, travelers } = req.body;
  
  // Check if this is a multi-city booking request
  if (flights && Array.isArray(flights)) {
    // Use the travelers data if available, otherwise create from name
    const bookingTravelers = travelers || (name ? [{
      firstName: name.first,
      lastName: name.last,
      email: "default@example.com",
      phone: "1234567890",
      dateOfBirth: "1990-01-01",
      gender: "MALE",
      passportNumber: "00000000",
      passportExpiryDate: "2030-01-01",
      passportCountry: "US",
      nationality: "US"
    }] : []);

    // Redirect to multi-city booking
    req.body.travelers = bookingTravelers;
    return router.stack.find(layer => 
      layer.route?.path === '/multi-city-booking' && 
      layer.route?.stack?.some((m: any) => m.method === 'post')
    )?.handle(req, res, () => {}) || res.status(500).json({
      success: false,
      error: "Multi-city booking handler not found"
    });
  }

  // Original single flight booking logic
  console.log("Single Flight Booking Parameters:", { flight, name });

  try {
    if (!flight) {
      return res.status(400).json({
        success: false,
        error: "flight parameter is required"
      });
    }

    if (!name || !name.first || !name.last) {
      return res.status(400).json({
        success: false,
        error: "name.first and name.last are required"
      });
    }

    const bookingData = {
      data: {
        type: "flight-order",
        flightOffers: [flight],
        travelers: [
          {
            id: "1",
            dateOfBirth: "1982-01-16",
            name: {
              firstName: name.first,
              lastName: name.last,
            },
            gender: "MALE",
            contact: {
              emailAddress: "jorge.gonzales833@telefonica.es",
              phones: [
                {
                  deviceType: "MOBILE",
                  countryCallingCode: "34",
                  number: "480080076",
                },
              ],
            },
            documents: [
              {
                documentType: "PASSPORT",
                birthPlace: "Madrid",
                issuanceLocation: "Madrid",
                issuanceDate: "2015-04-14",
                number: "00000000",
                expiryDate: "2025-04-14",
                issuanceCountry: "ES",
                validityCountry: "ES",
                nationality: "ES",
                holder: true,
              },
            ],
          },
        ],
      },
    };

    const response = await amadeus.booking.flightOrders.post(
      JSON.stringify(bookingData)
    );
    
    res.json({
      success: true,
      data: response.result,
      bookingId: response.result.data?.id
    });
  } catch (err: any) {
    console.error("Single flight booking error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to book flight",
      details: err.response?.body || err.message || err
    });
  }
});

// GET: Retrieve flight booking by ID
router.get("/flight-booking/:bookingId", async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  
  try {
    if (!bookingId) {
      res.status(400).json({
        success: false,
        error: "bookingId is required"
      });
    }

    const response = await amadeus.booking.flightOrder(bookingId).get();
    
    res.json({
      success: true,
      data: response.result
    });
  } catch (err: any) {
    console.error("Retrieve flight booking error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to retrieve flight booking",
      details: err.response?.body || err.message || err
    });
  }
});

// DELETE: Cancel flight booking
router.delete("/flight-booking/:bookingId", async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  
  try {
    if (!bookingId) {
       res.status(400).json({
        success: false,
        error: "bookingId is required"
      });
    }

    const response = await amadeus.booking.flightOrder(bookingId).delete();
    
    res.json({
      success: true,
      data: response.result,
      message: "Flight booking cancelled successfully"
    });
  } catch (err: any) {
    console.error("Cancel flight booking error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to cancel flight booking",
      details: err.response?.body || err.message || err
    });
  }
});

export default router;
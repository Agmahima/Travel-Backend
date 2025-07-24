import { Router, Request, Response } from "express";
// import Amadeus from "amadeus";
const router = Router();
const Amadeus = require('amadeus');
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID || "missing-client-id",
  clientSecret: process.env.AMADEUS_CLIENT_SECRET || "missing-client-secret",
});

// GET: City and Airport Search
router.get("/city-and-airport-search/:parameter", async (req: Request, res: Response) => {
  const parameter = req.params.parameter;
  try {
    const response = await amadeus.referenceData.locations.get({
      keyword: parameter,
      subType: Amadeus.location.any,
    });
    res.json(response.result);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// GET: Flight Search
router.get("/flight-search", async (req: Request, res: Response) => {
  const { originCode, destinationCode, dateOfDeparture } = req.query;

  console.log("Flight Search Parameters:", {
    originCode,
    destinationCode,
    dateOfDeparture,
  });

  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: originCode,
      destinationLocationCode: destinationCode,
      departureDate: dateOfDeparture,
      adults: '1',
      max: '7',
    });
    res.json(response.result);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// POST: Flight Confirmation
router.post("/flight-confirmation", async (req: Request, res: Response) => {
  const { flight } = req.body;

  try {
    const response = await amadeus.shopping.flightOffers.pricing.post(
      JSON.stringify({
        data: {
          type: "flight-offers-pricing",
          flightOffers: [flight],
        },
      })
    );
    res.json(response.result);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// POST: Flight Booking
router.post("/flight-booking", async (req: Request, res: Response) => {
  const { flight, name } = req.body;

  console.log("Flight Booking Parameters:", {
    flight,
    name,
  });

  // console.log("Flight Booking Request Body:", "mahima");
  try {
    const response = await amadeus.booking.flightOrders.post(
      JSON.stringify({
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
      })
    );
    res.json(response.result);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

export default router;

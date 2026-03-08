// const Amadeus = require('amadeus');

// class AmadeusService {
// private client: InstanceType<typeof Amadeus>;

//   constructor() {
//     this.client = new Amadeus({
//       clientId: process.env.AMADEUS_CLIENT_ID!,
//       clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
//       hostname: process.env.AMADEUS_HOSTNAME === 'production' ? 'production' : 'test'
//     });
//   }

//   // Search hotels by city
//   async searchHotelsByCity(params: {
//     cityCode: string;
//     checkInDate: string;
//     checkOutDate: string;
//     adults: number;
//     roomQuantity?: number;
//     radius?: number;
//     radiusUnit?: 'KM' | 'MILE';
//     ratings?: string[];
//     amenities?: string[];
//   }) {
//     try {
//       const response = await this.client.shopping.hotelOffersSearch.get({
//         cityCode: params.cityCode,
//         checkInDate: params.checkInDate,
//         checkOutDate: params.checkOutDate,
//         adults: params.adults.toString(),
//         roomQuantity: (params.roomQuantity || 1).toString(),
//         ...(params.radius && { radius: params.radius.toString() }),
//         ...(params.radiusUnit && { radiusUnit: params.radiusUnit }),
//         ...(params.ratings && { ratings: params.ratings.join(',') }),
//         ...(params.amenities && { amenities: params.amenities.join(',') })
//       });

//       console.log('✅ Amadeus search success:', response.data?.length, 'hotels found');
//       return response.data;
//     } catch (error) {
//       console.error('Amadeus search error:', error);
//       throw error;
//     }
//   }

//   // Search hotels by geocode (lat/long)
//   async searchHotelsByGeocode(params: {
//     latitude: number;
//     longitude: number;
//     checkInDate: string;
//     checkOutDate: string;
//     adults: number;
//     roomQuantity?: number;
//     radius?: number;
//   }) {
//     try {
//       const response = await this.client.shopping.hotelOffersSearch.get({
//         latitude: params.latitude,
//         longitude: params.longitude,
//         checkInDate: params.checkInDate,
//         checkOutDate: params.checkOutDate,
//         adults: params.adults.toString(),
//         roomQuantity: (params.roomQuantity || 1).toString(),
//         radius: params.radius?.toString() || '5',
//         radiusUnit: 'KM'
//       });

//       return response.data;
//     } catch (error) {
//       console.error('Amadeus geocode search error:', error);
//       throw error;
//     }
//   }

//   // Get specific hotel offer details
//   async getHotelOffer(offerId: string) {
//     try {
//       const response = await this.client.shopping.hotelOfferSearch(offerId).get();
//       return response.data;
//     } catch (error) {
//       console.error('Amadeus hotel offer error:', error);
//       throw error;
//     }
//   }

//   // Book hotel
//   async bookHotel(bookingData: {
//     offerId: string;
//     guests: Array<{
//       tid: number;
//       title: string;
//       firstName: string;
//       lastName: string;
//       phone: string;
//       email: string;
//     }>;
//     payments: Array<{
//       method: string;
//       card: {
//         vendorCode: string;
//         cardNumber: string;
//         expiryDate: string;
//       };
//     }>;
//   }) {
//     try {
//       const response = await this.client.booking.hotelBookings.post(
//         JSON.stringify({
//           data: {
//             offerId: bookingData.offerId,
//             guests: bookingData.guests,
//             payments: bookingData.payments
//           }
//         })
//       );

//       return response.data;
//     } catch (error) {
//       console.error('Amadeus booking error:', error);
//       throw error;
//     }
//   }

//   // Get hotel by ID (specific hotel details)
//   async getHotelById(hotelId: string) {
//     try {
//       const response = await this.client.shopping.hotelOffersSearch.get({
//         hotelIds: hotelId
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Amadeus hotel by ID error:', error);
//       throw error;
//     }
//   }
// }


// export default new AmadeusService();

// src/services/amadeus.service.ts

// src/services/amadeus.service.ts
const Amadeus = require('amadeus');

class AmadeusService {
  private client: InstanceType<typeof Amadeus>;

  constructor() {
    this.client = new Amadeus({
      clientId: process.env.AMADEUS_API_KEY!,
      clientSecret: process.env.AMADEUS_API_SECRET!,
      hostname: process.env.AMADEUS_ENV === 'production' ? 'production' : 'test'
    });
  }

  // STEP 1: Get hotel IDs by city code
  async getHotelsByCity(cityCode: string) {
    try {
      console.log('🏙️ Getting hotels for city:', cityCode);
      
      const response = await this.client.referenceData.locations.hotels.byCity.get({
        cityCode: cityCode
      });

      console.log('✅ Hotels found:', response.data?.length);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting hotels by city:', error);
      if (error.response) {
        console.error('Error details:', {
          status: error.response.statusCode,
          body: error.response.body
        });
      }
      throw error;
    }
  }

  // STEP 2: Get offers for specific hotel IDs
  async getHotelOffers(params: {
    hotelIds: string[];
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    roomQuantity?: number;
  }) {
    try {
      console.log('🏨 Getting offers for hotels:', params.hotelIds.length, 'hotels');

      const limitedHotelIds = params.hotelIds.slice(0, 50);

      const response = await this.client.shopping.hotelOffersSearch.get({
        hotelIds: limitedHotelIds.join(','),
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        adults: params.adults.toString(),
        roomQuantity: (params.roomQuantity || 1).toString(),
      });

      console.log('✅ Offers found:', response.data?.length);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting hotel offers:', error);
      if (error.response) {
        console.error('Error details:', {
          status: error.response.statusCode,
          body: error.response.body
        });
      }
      throw error;
    }
  }

  // Combined: Search hotels by city with offers
  async searchHotelsByCity(params: {
    cityCode: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    roomQuantity?: number;
    radius?: number;
    radiusUnit?: 'KM' | 'MILE';
    ratings?: string[];
    amenities?: string[];
  }) {
    try {
      console.log('🔍 Step 1: Getting hotel IDs for city:', params.cityCode);
      const hotels = await this.getHotelsByCity(params.cityCode);

      if (!hotels || hotels.length === 0) {
        console.log('❌ No hotels found for city:', params.cityCode);
        return [];
      }

      const hotelIds = hotels.map((h: any) => h.hotelId);
      console.log('✅ Found', hotelIds.length, 'hotel IDs');

      console.log('🔍 Step 2: Getting offers for hotels...');
      const offers = await this.getHotelOffers({
        hotelIds,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        adults: params.adults,
        roomQuantity: params.roomQuantity
      });

      return offers || [];
    } catch (error: any) {
      console.error('❌ searchHotelsByCity error:', error);
      throw error;
    }
  }

  // ✅ ADD THIS - Search hotels by geocode (lat/long)
  async searchHotelsByGeocode(params: {
    latitude: number;
    longitude: number;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    roomQuantity?: number;
    radius?: number;
  }) {
    try {
      console.log('🗺️ Getting hotels by geocode:', params.latitude, params.longitude);

      const response = await this.client.shopping.hotelOffersSearch.get({
        latitude: params.latitude.toString(),
        longitude: params.longitude.toString(),
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        adults: params.adults.toString(),
        roomQuantity: (params.roomQuantity || 1).toString(),
        radius: (params.radius || 5).toString(),
        radiusUnit: 'KM'
      });

      console.log('✅ Offers found:', response.data?.length);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting hotels by geocode:', error);
      if (error.response) {
        console.error('Error details:', {
          status: error.response.statusCode,
          body: error.response.body
        });
      }
      throw error;
    }
  }

  // ✅ ADD THIS - Get ALL offers for a hotel (multiple room types)
  async getHotelOffersById(params: {
    hotelId: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    roomQuantity?: number;
  }) {
    try {
      console.log('🏨 Getting all offers for hotel:', params.hotelId);

      const response = await this.client.shopping.hotelOffersSearch.get({
        hotelIds: params.hotelId,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        adults: params.adults.toString(),
        roomQuantity: (params.roomQuantity || 1).toString(),
        bestRateOnly: false, // ✅ IMPORTANT: Get ALL room types, not just cheapest
        currency: 'USD',
        paymentPolicy: 'NONE'
      });

      console.log('✅ Found', response.data?.length || 0, 'offers for hotel');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting hotel offers by ID:', error);
      if (error.response) {
        console.error('Error details:', {
          status: error.response.statusCode,
          body: error.response.body
        });
      }
      throw error;
    }
  }

  // Get specific hotel offer details by offer ID
  async getHotelOffer(offerId: string) {
    try {
      console.log('🔍 Getting hotel offer:', offerId);
      const response = await this.client.shopping.hotelOfferSearch(offerId).get();
      console.log('✅ Offer retrieved:', response.data?.hotel?.name);
      return response.data;
    } catch (error: any) {
      console.error('❌ Amadeus hotel offer error:', error);
      if (error.response) {
        console.error('Error details:', {
          status: error.response.statusCode,
          body: error.response.body
        });
      }
      throw error;
    }
  }

  // Book hotel
  async bookHotel(bookingData: {
    offerId: string;
    guests: Array<{
      tid: number;
      title: string;
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
    }>;
    payments: Array<{
      method: string;
      card: {
        vendorCode: string;
        cardNumber: string;
        expiryDate: string;
      };
    }>;
  }) {
    try {
      console.log('🏨 Booking hotel with Amadeus...');
      const response = await this.client.booking.hotelBookings.post(
        JSON.stringify({
          data: {
            offerId: bookingData.offerId,
            guests: bookingData.guests,
            payments: bookingData.payments
          }
        })
      );
      console.log('✅ Hotel booked successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Amadeus booking error:', error);
      if (error.response) {
        console.error('Error details:', {
          status: error.response.statusCode,
          body: error.response.body
        });
      }
      throw error;
    }
  }
}

export default new AmadeusService();
// import https from 'https';
// import { Request, Response } from 'express';
// import { HotelBooking } from '../models/HotelBooking';
// import amadeusService from '../services/amadeus.service';
// import googlePlacesService from '../services/googlePlaces.service';
// import Booking from '../models/Bookings';
// import { getOrCreateParentBooking, linkServiceToBooking, generateBookingReference } from '../utils/bookingHelpers';


// // Types and Interfaces
// interface ApiResponse<T = any> {
//   status: boolean;
//   message?: string;
//   data: T;
// }

// interface Destination {
//   dest_id: string;
//   name: string;
//   label: string;
//   search_type: string;
//   country: string;
//   region: string;
//   latitude: number;
//   longitude: number;
//   nr_hotels: number;
//   image_url: string;
// }

// interface FormattedDestination {
//   destId: string;
//   name: string;
//   label: string;
//   type: string;
//   country: string;
//   region: string;
//   latitude: number;
//   longitude: number;
//   hotelCount: number;
//   imageUrl: string;
// }

// interface Hotel {
//   hotel_id: string | number;
//   accessibilityLabel?: string;
//   property?: {
//     name?: string;
//     accuratePropertyClass?: number;
//     propertyClass?: number;
//     reviewScore?: number;
//     reviewCount?: number;
//     priceBreakdown?: any;
//     photoUrls?: string[];
//     mainPhotoId?: number;
//     latitude?: number;
//     longitude?: number;
//     wishlistName?: string;
//     countryCode?: string;
//     isPreferred?: boolean;
//     currency?: string;
//     blockIds?: string[];
//     checkin?: {
//       fromTime?: string;
//       untilTime?: string;
//     };
//     checkout?: {
//       fromTime?: string;
//       untilTime?: string;
//     };
//     checkinDate?: string;
//     checkoutDate?: string;
//     position?: number;
//     ufi?: number;
//     reviewScoreWord?: string;
//     [key: string]: any;
//   };
//   [key: string]: any; // Allow additional properties
// }

// interface FormattedHotel {
//   hotelId: string;
//   hotelName: string;
//   starRating: number;
//   reviewScore: number;
//   reviewCount: number;
//   priceBreakdown: any;
//   mainPhoto: string;
//   latitude: number;
//   longitude: number;
//   distance: number;
//   address: string;
//   city: string;
//   country: string;
//   facilities: string[];
//   isGeniusDeal: boolean;
//   soldOut: boolean;
//   // Additional properties from the actual API
//   reviewScoreWord?: string;
//   currency?: string;
//   isPreferred?: boolean;
//   checkinTime?: string;
//   checkoutTime?: string;
// }

// interface SearchHotelsQuery {
//   dest_id?: string | string[];
//   checkin_date?: string | string[];
//   checkout_date?: string | string[];
//   adults?: string | string[];
//   children_age?: string | string[];
//   room_qty?: string | string[];
//   page_number?: string | string[];
//   currency_code?: string | string[];
//   units?: string | string[];
//   temperature_unit?: string | string[];
//   languagecode?: string | string[];
// }

// interface HotelDetailsQuery {
//   hotel_id?: string | string[];
//   arrival_date?: string | string[];
//   departure_date?: string | string[];
//   adults?: string | string[];
//   children_age?: string | string[];
//   room_qty?: string | string[];
//   currency_code?: string | string[];
//   units?: string | string[];
//   temperature_unit?: string | string[];
//   languagecode?: string | string[];
// }

// interface BookingRequest {
//   bookingId?: string;
//   tripId: string;
//   userId: string;
//   hotelDetails: {
//     hotelId: string;
//     hotelName: string;
//     address: string;
//     starRating?: number;
//     propertyType?: string;
//     checkInPolicy?: string;
//     checkOutPolicy?: string;
//     coordinates?: {
//       latitude?: number;
//       longitude?: number;
//     };
//   };
//   stayDetails: {
//     checkIn: string;
//     checkOut: string;
//     nights: number;
//     rooms: {
//       roomType: string;
//       occupancy?: {
//         adults?: number;
//         children?: number;
//       };
//       assignedTravelers?: string[];
//     }[];
//     searchParams?: {              // ✅ Add this block
//       roomQuantity?: number;
//       adults?: number;
//       children?: number;
//     };
//   };
//   leadGuest: {
//     travelerId: string;
//   };
//   pricing: {
//     basePrice: number;
//     taxes?: number;
//     fees?: number;
//     totalPrice: number;
//     currency?: string;
//     priceBreakdown?: any[];
//     cancellationPolicy?: string;
//     paymentPolicy?: string;
//   };
//   specialRequests?: string;
//   additionalServices?: any[];
// }


// interface UpdateBookingStatusRequest {
//   status: string;
//   confirmationNumber?: string;
//   voucherNumber?: string;
// }

// interface RoomDetail {
//   roomId: string;
//   roomName: string;
//   roomType: string;
//   bedConfiguration: any;
//   facilities: string[];
//   photos: any[];
//   maxOccupancy: number;
//   roomSize: number;
//   mealPlan: string;
//   blockId: string;
//   pricing: {
//     basePrice: number;
//     currency: string;
//   };
//   policies: {
//     cancellation?: any;
//     prepayment?: any;
//   };
//   availability: {
//     available: boolean;
//     roomCount: number;
//   };
//   // Additional properties for hotel details
//   highlights?: any[];
//   privateBathroomCount?: number;
//   refundable?: boolean;
//   breakfastIncluded?: boolean;
//   roomSurface?: {
//     squareMeters?: number;
//     squareFeet?: number;
//   };
// }

// class HotelController {
//   private readonly rapidApiKey: string;
//   private readonly baseUrl: string;

//   constructor() {
//     this.rapidApiKey = process.env.RAPIDAPI_KEY || '61fd36de18mshb3497e3f27f8beap13ed6ejsn98fa204d7a62';
//     this.baseUrl = 'booking-com15.p.rapidapi.com';
//   }

//   private makeApiRequest<T = any>(path: string, options: { headers?: Record<string, string> } = {}): Promise<ApiResponse<T>> {
//     return new Promise((resolve, reject) => {
//       console.log('Making API request to:', `https://${this.baseUrl}${path}`);
      
//       const requestOptions: https.RequestOptions = {
//         method: 'GET',
//         hostname: this.baseUrl,
//         port: null,
//         path,
//         headers: {
//           'x-rapidapi-key': this.rapidApiKey,
//           'x-rapidapi-host': this.baseUrl,
//           ...options.headers
//         }
//       };

//       console.log('Request options:', JSON.stringify(requestOptions, null, 2));

//       const req = https.request(requestOptions, (res) => {
//         console.log('Response status:', res.statusCode);
//         console.log('Response headers:', res.headers);
        
//         const chunks: Buffer[] = [];

//         res.on('data', (chunk: Buffer) => {
//           chunks.push(chunk);
//         });

//         res.on('end', () => {
//           try {
//             const body = Buffer.concat(chunks);
//             const bodyString = body.toString();
//             console.log('Raw response body:', bodyString.substring(0, 1000) + '...'); // First 1000 chars
            
//             const data = JSON.parse(bodyString) as ApiResponse<T>;
//             console.log('Parsed response status:', data.status);
            
//             if (data.status === true) {
//               resolve(data);
//             } else {
//               console.log('API returned status false:', data.message);
//               reject(new Error(data.message || 'API request failed'));
//             }
//           } catch (error) {
//             console.log('Failed to parse response:', error);
//             reject(new Error('Failed to parse API response'));
//           }
//         });
//       });

//       req.on('error', (error: Error) => {
//         console.log('Request error:', error);
//         reject(error);
//       });

//       req.end();
//     });
//   }

//   searchDestinations = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const { query }: { query?: string } = req.query;

//       if (!query || query.trim().length < 2) {
//         res.status(400).json({
//           success: false,
//           message: 'Query parameter is required and must be at least 2 characters long'
//         });
//         return;
//       }

//       const path = `/api/v1/hotels/searchDestination?query=${encodeURIComponent(query)}`;
//       const data = await this.makeApiRequest<Destination[]>(path);

//       const formattedDestinations: FormattedDestination[] = data.data.map(destination => ({
//         destId: destination.dest_id,
//         name: destination.name,
//         label: destination.label,
//         type: destination.search_type,
//         country: destination.country,
//         region: destination.region,
//         latitude: destination.latitude,
//         longitude: destination.longitude,
//         hotelCount: destination.nr_hotels,
//         imageUrl: destination.image_url
//       }));

//       res.json({
//         success: true,
//         data: formattedDestinations,
//         timestamp: new Date().toISOString()
//       });

//     } catch (error) {
//       console.error('Error searching destinations:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to search destinations',
//         error: error instanceof Error ? error.message : 'Unknown error'
//       });
//     }
//   }

//   // Debug endpoint to see raw API response
//   debugSearchHotels = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const query = req.query as Record<string, string>;
//       const {
//         dest_id,
//         checkin_date,
//         checkout_date,
//         adults = '1',
//         children_age = '',
//         room_qty = '1',
//         page_number = '1',
//         currency_code = 'INR',
//         units = 'metric',
//         temperature_unit = 'c',
//         languagecode = 'en-us'
//       } = query;

//       if (!dest_id || !checkin_date || !checkout_date) {
//         res.status(400).json({
//           success: false,
//           message: 'Required parameters missing'
//         });
//         return;
//       }

//       const path = `/api/v1/hotels/searchHotels?dest_id=${dest_id}&search_type=CITY&arrival_date=${checkin_date}&departure_date=${checkout_date}&adults=${adults}&children_age=${children_age}&room_qty=${room_qty}&page_number=${page_number}&units=${units}&temperature_unit=${temperature_unit}&languagecode=${languagecode}&currency_code=${currency_code}`;
      
//       console.log('Debug API Path:', path);
//       console.log('Debug API Base URL:', this.baseUrl);

//       const data = await this.makeApiRequest<any>(path);
      
//       console.log('Debug Full Response:', JSON.stringify(data, null, 2));

//       // Return raw API response for debugging
//       res.json({
//         success: true,
//         apiPath: path,
//         rawData: data,
//         dataStructure: {
//           hasData: !!data.data,
//           dataKeys: data.data ? Object.keys(data.data) : [],
//           hasHotels: !!(data.data && data.data.hotels),
//           hotelsLength: data.data?.hotels?.length || 0,
//           sampleHotel: data.data?.hotels?.[0] || null,
//           hotelKeys: data.data?.hotels?.[0] ? Object.keys(data.data.hotels[0]) : []
//         },
//         timestamp: new Date().toISOString()
//       });

//     } catch (error) {
//       console.error('Debug search hotels error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Debug request failed',
//         error: error instanceof Error ? error.message : 'Unknown error',
//         stack: error instanceof Error ? error.stack : undefined
//       });
//     }
//   }

//   searchHotels = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const query = req.query as Record<string, string>;
//       const {
//         dest_id,
//         checkin_date,
//         checkout_date,
//         adults = '1',
//         children_age = '',
//         room_qty = '1',
//         page_number = '1',
//         currency_code = 'INR',
//         units = 'metric',
//         temperature_unit = 'c',
//         languagecode = 'en-us'
//       } = query;

//       if (!dest_id) {
//         res.status(400).json({
//           success: false,
//           message: 'Destination ID is required'
//         });
//         return;
//       }

//       if (!checkin_date || !checkout_date) {
//         res.status(400).json({
//           success: false,
//           message: 'Check-in and check-out dates are required'
//         });
//         return;
//       }

//       const checkinDate = new Date(checkin_date);
//       const checkoutDate = new Date(checkout_date);
//       const today = new Date();

//       if (checkinDate < today) {
//         res.status(400).json({
//           success: false,
//           message: 'Check-in date cannot be in the past'
//         });
//         return;
//       }

//       if (checkoutDate <= checkinDate) {
//         res.status(400).json({
//           success: false,
//           message: 'Check-out date must be after check-in date'
//         });
//         return;
//       }

//       const path = `/api/v1/hotels/searchHotels?dest_id=${dest_id}&search_type=CITY&arrival_date=${checkin_date}&departure_date=${checkout_date}&adults=${adults}&children_age=${children_age}&room_qty=${room_qty}&page_number=${page_number}&units=${units}&temperature_unit=${temperature_unit}&languagecode=${languagecode}&currency_code=${currency_code}`;

//       const data = await this.makeApiRequest<{ hotels?: Hotel[]; total_count?: number }>(path);

//       // Add debugging to see the actual API response structure
//       console.log('Full API Response:', JSON.stringify(data, null, 2));
//       console.log('Hotels array length:', data.data.hotels?.length);
//       console.log('First hotel raw data:', JSON.stringify(data.data.hotels?.[0], null, 2));

//       const formattedHotels: FormattedHotel[] = data.data.hotels?.map((hotel, index) => {
//         // Log each hotel's raw data for debugging
//         if (index < 3) { // Only log first 3 hotels to avoid spam
//           console.log(`Hotel ${index} raw data:`, JSON.stringify(hotel, null, 2));
//         }
        
//         const property = hotel.property || {};
//         const priceInfo = property.priceBreakdown || {};
        
//         return {
//           hotelId: hotel.hotel_id?.toString() || '',
//           hotelName: property.name || 'Name not available',
//           starRating: property.accuratePropertyClass || property.propertyClass || 0,
//           reviewScore: property.reviewScore || 0,
//           reviewCount: property.reviewCount || 0,
//           priceBreakdown: {
//             grossPrice: priceInfo.grossPrice || {},
//             excludedPrice: priceInfo.excludedPrice || {},
//             strikethroughPrice: priceInfo.strikethroughPrice || null,
//             benefitBadges: priceInfo.benefitBadges || [],
//             taxExceptions: priceInfo.taxExceptions || []
//           },
//           mainPhoto: property.photoUrls?.[0] || property.photoUrls?.[1] || property.photoUrls?.[2] || '',
//           latitude: property.latitude || 0,
//           longitude: property.longitude || 0,
//           distance: 0, // Not available in search results
//           address: '', // Would need to be fetched from hotel details
//           city: property.wishlistName || 'City not available',
//           country: property.countryCode ? property.countryCode.toUpperCase() : 'Country not available',
//           facilities: [], // Not available in search results
//           isGeniusDeal: property.isPreferred || false,
//           soldOut: false, // Not available in this structure
//           // Additional properties from the actual API
//           reviewScoreWord: property.reviewScoreWord || '',
//           currency: property.currency || 'INR',
//           isPreferred: property.isPreferred || false,
//           checkinTime: property.checkin?.fromTime || '',
//           checkoutTime: property.checkout?.untilTime || ''
//         };
//       }) || [];

//       res.json({
//         success: true,
//         data: {
//           hotels: formattedHotels,
//           totalResults: data.data.total_count || formattedHotels.length,
//           pageNumber: parseInt(page_number),
//           searchParams: {
//             destId: dest_id,
//             checkinDate: checkin_date,
//             checkoutDate: checkout_date,
//             adults: parseInt(adults),
//             rooms: parseInt(room_qty)
//           }
//         },
//         timestamp: new Date().toISOString()
//       });

//     } catch (error) {
//       console.error('Error searching hotels:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to search hotels',
//         error: error instanceof Error ? error.message : 'Unknown error'
//       });
//     }
//   }

//   getHotelDetails = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const query = req.query as Record<string, string>;
//       const {
//         hotel_id,
//         arrival_date,
//         departure_date,
//         adults = '1',
//         children_age = '',
//         room_qty = '1',
//         currency_code = 'INR',
//         units = 'metric',
//         temperature_unit = 'c',
//         languagecode = 'en-us'
//       } = query;

//       if (!hotel_id) {
//         res.status(400).json({
//           success: false,
//           message: 'Hotel ID is required'
//         });
//         return;
//       }

//       if (!arrival_date || !departure_date) {
//         res.status(400).json({
//           success: false,
//           message: 'Arrival and departure dates are required'
//         });
//         return;
//       }

//       const path = `/api/v1/hotels/getHotelDetails?hotel_id=${hotel_id}&arrival_date=${arrival_date}&departure_date=${departure_date}&adults=${adults}&children_age=${children_age}&room_qty=${room_qty}&units=${units}&temperature_unit=${temperature_unit}&languagecode=${languagecode}&currency_code=${currency_code}`;

//       const data = await this.makeApiRequest<any>(path);
//       const hotel = data.data;

//       // Map the hotel details based on actual API response structure
//       const hotelDetails = {
//         hotelInfo: {
//           hotelId: hotel.hotel_id?.toString() || '',
//           hotelName: hotel.hotel_name || '',
//           hotelNameTranslated: hotel.hotel_name_trans || '',
//           url: hotel.url || '',
//           address: {
//             street: hotel.address || '',
//             city: hotel.city || '',
//             cityTranslated: hotel.city_trans || '',
//             district: hotel.district || '',
//             country: hotel.country_trans || '',
//             countryCode: hotel.countrycode || '',
//             zipCode: hotel.zip || '',
//             addressTranslated: hotel.address_trans || '',
//             latitude: hotel.latitude || 0,
//             longitude: hotel.longitude || 0,
//             distanceToCenter: hotel.distance_to_cc || 0
//           },
//           starRating: hotel.rawData?.accuratePropertyClass || hotel.rawData?.propertyClass || 0,
//           propertyType: hotel.accommodation_type_name || '',
//           reviewScore: hotel.rawData?.reviewScore || 0,
//           reviewCount: hotel.rawData?.reviewCount || hotel.review_nr || 0,
//           reviewScoreWord: hotel.rawData?.reviewScoreWord || '',
//           timezone: hotel.timezone || '',
//           defaultLanguage: hotel.default_language || ''
//         },
//         pricing: {
//           productPriceBreakdown: hotel.product_price_breakdown || {},
//           compositePriceBreakdown: hotel.composite_price_breakdown || {},
//           currencyCode: hotel.currency_code || 'INR',
//           priceTransparencyMode: hotel.price_transparency_mode || ''
//         },
//         facilities: {
//           propertyHighlights: hotel.property_highlight_strip?.map((item: any) => ({
//             name: item.name,
//             icons: item.icon_list?.map((icon: any) => ({
//               icon: icon.icon,
//               size: icon.size
//             })) || []
//           })) || [],
//           facilitiesBlock: hotel.facilities_block?.facilities?.map((facility: any) => ({
//             name: facility.name,
//             icon: facility.icon
//           })) || [],
//           topBenefits: hotel.top_ufi_benefits?.map((benefit: any) => ({
//             name: benefit.translated_name,
//             icon: benefit.icon
//           })) || [],
//           familyFacilities: hotel.family_facilities || []
//         },
//         rooms: this.formatRoomDetailsFromHotelDetails(hotel.rooms, hotel.block),
//         policies: this.extractPoliciesFromHotelDetails(hotel.block),
//         breakfastInfo: {
//           reviewScore: hotel.breakfast_review_score?.review_score || 0,
//           reviewCount: hotel.breakfast_review_score?.review_count || 0,
//           reviewScoreWord: hotel.breakfast_review_score?.review_score_word || '',
//           rating: hotel.breakfast_review_score?.rating || 0
//         },
//         wifiInfo: {
//           rating: hotel.wifi_review_score?.rating || 0
//         },
//         importantInfo: hotel.hotel_important_information_with_codes?.map((info: any) => info.phrase) || [],
//         languages: {
//           spoken: hotel.spoken_languages || [],
//           languageCode: hotel.languages_spoken?.languagecode || []
//         },
//         availability: {
//           availableRooms: hotel.available_rooms || 0,
//           maxRoomsInReservation: hotel.max_rooms_in_reservation || 0,
//           soldOut: hotel.soldout === 1,
//           isClosed: hotel.is_closed === 1,
//           isGeniusDeal: hotel.is_genius_deal === 1,
//           hotelIncludesBreakfast: hotel.hotel_include_breakfast === 1,
//           isFamilyFriendly: hotel.is_family_friendly === 1
//         },
//         lastReservation: hotel.last_reservation || {},
//         aggregatedData: hotel.aggregated_data || {}
//       };

//       res.json({
//         success: true,
//         data: hotelDetails,
//         timestamp: new Date().toISOString()
//       });

//     } catch (error) {
//       console.error('Error getting hotel details:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get hotel details',
//         error: error instanceof Error ? error.message : 'Unknown error'
//       });
//     }
//   }

//   createHotelBooking = async (req: Request<{}, {}, BookingRequest>, res: Response): Promise<void> => {
//   try {
//      const userId= req.session.userId;
//   const { tripId } = req.body;
//     const {
//       bookingId,
      
//       hotelDetails,
//       stayDetails,
//       leadGuest,
//       pricing,
//       specialRequests,
//       additionalServices
//     } = req.body;

//     console.log('Creating hotel booking for user:', userId, 'tripId:', tripId);
//     console.log(req.body);

//     // ✅ Validate essential fields
//     if (!tripId || !userId || !hotelDetails || !stayDetails || !leadGuest || !pricing) {
//       res.status(400).json({
//         success: false,
//         message: 'Missing required booking information (tripId, userId, hotelDetails, stayDetails, leadGuest, pricing required)'
//       });
//       return;
//     }

//     // ✅ Ensure parent booking exists or create a new draft booking
//     // let parentBooking = await Booking.findOne({ _id: bookingId }) || await Booking.findOne({ tripId, userId });

//     // if (!parentBooking) {
//     //   console.log("⚠️ No parent booking found. Creating new draft booking...");

//     //   const bookingReference = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
//     //   parentBooking = new Booking({
//     //     tripId,
//     //     userId,
//     //     bookingReference,
//     //     status: 'draft',
//     //     pricing: {
//     //       totalAmount: 0,
//     //       currency: 'INR'
//     //     },
//     //     paymentSummary: {
//     //       totalPaid: 0,
//     //       totalRefunded: 0,
//     //       paymentStatus: 'pending'
//     //     }
//     //   });

//     //   await parentBooking.save();
//     //   console.log("✅ Created new draft parent booking:", parentBooking._id);
//     // }

//     // // ✅ Generate hotel booking reference
//     // const hotelBookingRef = `HB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

//      const parentBooking = await getOrCreateParentBooking(
//       userId?.toString(), 
//       tripId, 
//       pricing.currency || 'INR'
//     );

//     console.log("✅ Parent booking:", parentBooking._id);

//     // Generate hotel booking reference
//     const hotelBookingRef = generateBookingReference('HB');

//     // ✅ Create hotel booking entry
//     const hotelBooking = new HotelBooking({
//       bookingId: parentBooking._id,
//       hotelBookingRef,
//       hotelDetails: {
//         hotelId: hotelDetails.hotelId,
//         hotelName: hotelDetails.hotelName,
//         address: hotelDetails.address,
//         starRating: hotelDetails.starRating,
//         propertyType: hotelDetails.propertyType,
        
//       },
//       stayDetails: {
//         checkIn: new Date(stayDetails.checkIn),
//         checkOut: new Date(stayDetails.checkOut),
//         nights: stayDetails.nights,
//         searchParams: {
//           roomQuantity: stayDetails?.searchParams?.roomQuantity || 1,
//           adults: stayDetails?.searchParams?.adults || 1,
//           children: stayDetails?.searchParams?.children || 0
//         },
//         rooms: (stayDetails.rooms || []).map(room => ({
//           ...room,
//           occupancy: {
//             adults: room?.occupancy?.adults || 1,
//             children: room?.occupancy?.children || 0
//           },
//           assignedTravelers: room.assignedTravelers || []
//         }))
//       },
//       leadGuest: {
//         travelerId: leadGuest.travelerId
//       },
//       pricing: {
//         basePrice: pricing.basePrice,
//         taxes: pricing.taxes || 0,
//         fees: pricing.fees || 0,
//         totalPrice: pricing.totalPrice,
//         currency: pricing.currency || 'INR',
//         priceBreakdown: pricing.priceBreakdown || []
//       },
//       policies: {
//         cancellation: pricing.cancellationPolicy || '',
//         payment: pricing.paymentPolicy || '',
//         checkIn:  hotelDetails.checkInPolicy,
//         checkOut: hotelDetails.checkOutPolicy
//       },
//       specialRequests: specialRequests || '',
//       additionalServices: additionalServices || [],
//       status: 'draft'
//     });

//     await hotelBooking.save();

//     await linkServiceToBooking(
//       parentBooking._id,
//       'hotels',
//       hotelBooking._id,
//       pricing.totalPrice
//     );

//     // ✅ Link the hotel booking to parent booking
//     parentBooking.services.hotels.push(hotelBooking._id);
//     await parentBooking.save();

//     console.log('🏨 Hotel booking created:', hotelBooking._id);
//     console.log('🔗 Linked to parent booking:', parentBooking._id);

//     res.status(201).json({
//       success: true,
//       data: {
//         hotelBookingId: hotelBooking._id,
//         hotelBookingRef,
//         parentBookingId: parentBooking._id,
//         status: hotelBooking.status,
//         message: 'Hotel booking created successfully and linked to parent booking'
//       },
//       timestamp: new Date().toISOString()
//     });

//   } catch (error) {
//     console.error('❌ Error creating hotel booking:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create hotel booking',
//       error: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// };


//   getHotelBooking = async (req: Request<{ bookingRef: string }>, res: Response): Promise<void> => {
//     try {
//       const { bookingRef } = req.params;

//       const hotelBooking = await HotelBooking.findOne({
//         hotelBookingRef: bookingRef
//       }).populate('leadGuest.travelerId').populate('stayDetails.rooms.assignedTravelers.travelerId');

//       if (!hotelBooking) {
//         res.status(404).json({
//           success: false,
//           message: 'Hotel booking not found'
//         });
//         return;
//       }

//       res.json({
//         success: true,
//         data: hotelBooking,
//         timestamp: new Date().toISOString()
//       });

//     } catch (error) {
//       console.error('Error getting hotel booking:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get hotel booking',
//         error: error instanceof Error ? error.message : 'Unknown error'
//       });
//     }
//   }

//   updateBookingStatus = async (req: Request<{ bookingRef: string }, {}, UpdateBookingStatusRequest>, res: Response): Promise<void> => {
//     try {
//       const { bookingRef } = req.params;
//       const { status, confirmationNumber, voucherNumber } = req.body;

//       const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'] as const;
//       if (!validStatuses.includes(status as any)) {
//         res.status(400).json({
//           success: false,
//           message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
//         });
//         return;
//       }

//       const updateData: any = { status };
//       if (confirmationNumber) updateData.confirmationNumber = confirmationNumber;
//       if (voucherNumber) updateData.voucherNumber = voucherNumber;

//       const hotelBooking = await HotelBooking.findOneAndUpdate(
//         { hotelBookingRef: bookingRef },
//         updateData,
//         { new: true }
//       );

//       if (!hotelBooking) {
//         res.status(404).json({
//           success: false,
//           message: 'Hotel booking not found'
//         });
//         return;
//       }

//       res.json({
//         success: true,
//         data: hotelBooking,
//         message: `Hotel booking status updated to ${status}`,
//         timestamp: new Date().toISOString()
//       });

//     } catch (error) {
//       console.error('Error updating booking status:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to update booking status',
//         error: error instanceof Error ? error.message : 'Unknown error'
//       });
//     }
//   }

//   getUserHotelBookings = async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
//     try {
//       const { userId } = req.params;
//       const { status, page = '1', limit = '10' }: { status?: string; page?: string; limit?: string } = req.query;

//       const query: any = {};
//       if (status) query.status = status;

//       const pageNum = parseInt(page);
//       const limitNum = parseInt(limit);

//       const hotelBookings = await HotelBooking.find(query)
//         .populate('leadGuest.travelerId')
//         .sort({ createdAt: -1 })
//         .limit(limitNum)
//         .skip((pageNum - 1) * limitNum);

//       const total = await HotelBooking.countDocuments(query);

//       res.json({
//         success: true,
//         data: {
//           bookings: hotelBookings,
//           pagination: {
//             currentPage: pageNum,
//             totalPages: Math.ceil(total / limitNum),
//             totalBookings: total,
//             hasNextPage: pageNum * limitNum < total,
//             hasPrevPage: pageNum > 1
//           }
//         },
//         timestamp: new Date().toISOString()
//       });

//     } catch (error) {
//       console.error('Error getting user hotel bookings:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get hotel bookings',
//         error: error instanceof Error ? error.message : 'Unknown error'
//       });
//     }
//   }

//   // Helper method for hotel details room formatting
//   private formatRoomDetailsFromHotelDetails(rooms: any, blocks: any[]): RoomDetail[] {
//     if (!rooms || !blocks) return [];

//     const roomData: RoomDetail[] = [];
    
//     // Iterate through room IDs in the rooms object
//     Object.keys(rooms).forEach(roomId => {
//       const room = rooms[roomId];
//       // Find matching blocks for this room
//       const roomBlocks = blocks.filter(block => block.room_id?.toString() === roomId);

//       roomBlocks.forEach(block => {
//         roomData.push({
//           roomId: roomId,
//           roomName: block.room_name || block.name || 'Room',
//           roomType: room.description || 'Standard Room',
//           bedConfiguration: room.bed_configurations || [],
//           facilities: room.facilities?.map((f: any) => f.name) || [],
//           photos: room.photos || [],
//           maxOccupancy: parseInt(block.max_occupancy) || 1,
//           roomSize: block.room_surface_in_m2 || room.room_surface_in_m2 || 0,
//           mealPlan: block.mealplan || 'Room only',
//           blockId: block.block_id || '',
//           pricing: {
//             basePrice: 0, // Would need to extract from pricing breakdown
//             currency: 'INR'
//           },
//           policies: {
//             cancellation: block.paymentterms?.cancellation,
//             prepayment: block.paymentterms?.prepayment
//           },
//           availability: {
//             available: !block.soldout,
//             roomCount: block.room_count || 1
//           },
//           // Additional details from hotel details API
//           highlights: room.highlights || [],
//           privateBathroomCount: room.private_bathroom_count || 0,
//           refundable: block.refundable || false,
//           breakfastIncluded: block.breakfast_included || false,
//           roomSurface: {
//             squareMeters: block.room_surface_in_m2,
//             squareFeet: block.room_surface_in_feet2
//           }
//         });
//       });
//     });

//     return roomData;
//   }

//   // Helper method for hotel details policies
//   private extractPoliciesFromHotelDetails(blocks: any[]): Record<string, any> {
//     if (!blocks || blocks.length === 0) return {};

//     const policies: Record<string, any> = {};
    
//     blocks.forEach(block => {
//       if (block.paymentterms) {
//         if (block.paymentterms.cancellation) {
//           policies.cancellation = {
//             type: block.paymentterms.cancellation.type,
//             description: block.paymentterms.cancellation.description,
//             info: block.paymentterms.cancellation.info,
//             timeline: block.paymentterms.cancellation.timeline,
//             bucket: block.paymentterms.cancellation.bucket
//           };
//         }
//         if (block.paymentterms.prepayment) {
//           policies.prepayment = {
//             type: block.paymentterms.prepayment.type,
//             description: block.paymentterms.prepayment.description,
//             info: block.paymentterms.prepayment.info,
//             timeline: block.paymentterms.prepayment.timeline
//           };
//         }
//       }
      
//       if (block.block_text?.policies) {
//         policies.blockPolicies = block.block_text.policies;
//       }
//     });

//     return policies;
//   }

//   private formatRoomDetails(rooms: any, blocks: any[]): RoomDetail[] {
//     if (!rooms || !blocks) return [];

//     const roomData: RoomDetail[] = [];
    
//     Object.keys(rooms).forEach(roomId => {
//       const room = rooms[roomId];
//       const roomBlocks = blocks.filter(block => block.room_id.toString() === roomId);

//       roomBlocks.forEach(block => {
//         roomData.push({
//           roomId: roomId,
//           roomName: block.room_name,
//           roomType: room.description,
//           bedConfiguration: room.bed_configurations,
//           facilities: room.facilities?.map((f: any) => f.name) || [],
//           photos: room.photos || [],
//           maxOccupancy: block.max_occupancy,
//           roomSize: block.room_surface_in_m2,
//           mealPlan: block.mealplan,
//           blockId: block.block_id,
//           pricing: {
//             basePrice: block.price_breakdown?.net_amount || 0,
//             currency: block.price_breakdown?.currency || 'INR'
//           },
//           policies: {
//             cancellation: block.paymentterms?.cancellation,
//             prepayment: block.paymentterms?.prepayment
//           },
//           availability: {
//             available: !block.soldout,
//             roomCount: block.room_count
//           }
//         });
//       });
//     });

//     return roomData;
//   }

//   private extractPolicies(blocks: any[]): Record<string, any> {
//     if (!blocks || blocks.length === 0) return {};

//     const policies: Record<string, any> = {};
//     blocks.forEach(block => {
//       if (block.paymentterms) {
//         if (block.paymentterms.cancellation) {
//           policies.cancellation = block.paymentterms.cancellation.description;
//         }
//         if (block.paymentterms.prepayment) {
//           policies.prepayment = block.paymentterms.prepayment.description;
//         }
//       }
//     });

//     return policies;
//   }

//   private extractHotelPhotos(rooms: any): any[] {
//     const photos: any[] = [];
//     if (rooms) {
//       Object.values(rooms).forEach((room: any) => {
//         if (room.photos) {
//           photos.push(...room.photos);
//         }
//       });
//     }
//     return photos;
//   }
// }

// export default new HotelController();

import { Request, Response } from 'express';
import { HotelBooking } from '../models/HotelBooking';
import Booking from '../models/Bookings';
import amadeusService from '../services/amadeus.service';
import googlePlacesService from '../services/googlePlaces.service';
import { getOrCreateParentBooking, linkServiceToBooking, generateBookingReference } from '../utils/bookingHelpers';
import { getCityCode } from '../utils/cityCodeMapper';
import { link } from 'fs';

interface SearchDestinationsQuery {
  query?: string;
}

interface SearchHotelsQuery {
  cityCode?: string;
  latitude?: string;
  longitude?: string;
  checkInDate?: string;
  checkOutDate?: string;
  adults?: string;
  children?: string;
  rooms?: string;
  radius?: string;
  ratings?: string;
  amenities?: string;
}

interface HotelDetailsQuery {
  offerId?: string;
  checkInDate?: string;
  checkOutDate?: string;
  adults?: string;
  rooms?: string;
}

interface BookingRequest {
  bookingId?: string;
  tripId: string;
  userId: string;
  offerId: string;  // Amadeus offer ID
  hotelDetails: {
    hotelId: string;
    hotelName: string;
    address?: string | {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      full?: string;
    };
    addressStreet?: string;
    addressCity?: string;
    addressCountry?: string;
    
    cityCode?: string;
    latitude?: number;
    longitude?: number;
    starRating?: number;
    amenities?: string[];
  };
  stayDetails: {
    checkIn: string;
    checkOut: string;
    nights: number;
    rooms: Array<{
      roomType: string;
      description?: string;
      occupancy: {
        adults: number;
        children?: number;
      };
      assignedTravelers?: string[];
    }>;
    searchParams: {
      roomQuantity: number;
      adults: number;
      children: number;
    };
  };
  leadGuest: {
    travelerId: string;
    title: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  pricing: {
    basePrice: number;
    taxes?: number;
    fees?: number;
    totalPrice: number;
    currency: string;
    priceBreakdown?: any[];
  };
  policies?: {
    cancellation?: any;
    checkIn?: string;
    checkOut?: string;
  };
  specialRequests?: string;
  paymentDetails: {
    method: string;
    card: {
      vendorCode: string;
      cardNumber: string;
      expiryDate: string;
    };
  };
}

class HotelController {
  
  // Search destinations (city search for hotel locations)
  searchDestinations = async (req: Request<{}, {}, {}, SearchDestinationsQuery>, res: Response): Promise<void> => {
    try {
      const { query } = req.query;
      console.log('🔍 Searching destinations:', query);

      if (!query || query.trim().length < 2) {
        res.status(400).json({
          success: false,
          message: 'Query parameter is required and must be at least 2 characters long'
        });
        return;
      }

      // Note: Amadeus doesn't have a direct city search API
      // You can use their Location API or maintain your own city database
      // For now, we'll return a basic response structure
      
      // Alternative: Use Google Places Autocomplete
      const searchResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
        `input=${encodeURIComponent(query)}` +
        `&types=(cities)` +
        `&key=${process.env.GOOGLE_PLACES_API_KEY}`
      );

      const data = await searchResponse.json();

      const formattedDestinations = data.predictions?.map((prediction: any) => {
        const cityName = prediction.structured_formatting.main_text;
      const cityCode = getCityCode(cityName);
      
      return {
        name: prediction.description,
        cityName: cityName,
        cityCode: cityCode, // ✅ Add IATA code
        placeId: prediction.place_id,
        description: prediction.structured_formatting.main_text,
        label: prediction.structured_formatting.secondary_text,
        isSupported: cityCode !== null // ✅ Flag if we can search hotels here
      };
    }).filter((dest: any) => dest.isSupported) || []; // ✅ Only return supported cities


      res.json({
        success: true,
        data: formattedDestinations,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error searching destinations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search destinations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Search hotels
  searchHotels = async (req: Request<{}, {}, {}, SearchHotelsQuery>, res: Response): Promise<void> => {
  try {
    const {
      cityCode,
      latitude,
      longitude,
      checkInDate,
      checkOutDate,
      adults = '1',
      children = '0',
      rooms = '1',
      radius,
      ratings,
      amenities
    } = req.query;

    console.log('🔍 Hotel search request:', { cityCode, checkInDate, checkOutDate, adults, rooms });

    // ... existing validation code ...

    // Search hotels with Amadeus
    let amadeusHotels;
    
    console.log('🔍 Calling Amadeus API...');
    if (!checkInDate || !checkOutDate) {
      res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required'
      });
      return;
    }

    
    if (cityCode) {
      amadeusHotels = await amadeusService.searchHotelsByCity({
        cityCode,
        checkInDate,
        checkOutDate,
        adults: parseInt(adults),
        roomQuantity: parseInt(rooms),
        radius: radius ? parseInt(radius) : undefined,
        radiusUnit: 'KM',
        ratings: ratings ? (ratings as string).split(',') : undefined,
        amenities: amenities ? (amenities as string).split(',') : undefined
      });
    } else if (latitude && longitude) {
      amadeusHotels = await amadeusService.searchHotelsByGeocode({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        checkInDate,
        checkOutDate,
        adults: parseInt(adults),
        roomQuantity: parseInt(rooms),
        radius: radius ? parseInt(radius) : 5
      });
    }

    console.log('✅ Amadeus returned:', amadeusHotels?.length || 0, 'hotels');

    if (!amadeusHotels || amadeusHotels.length === 0) {
      res.json({
        success: true,
        data: {
          hotels: [],
          totalResults: 0,
          searchParams: { cityCode, checkInDate, checkOutDate, adults, rooms }
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Enrich with Google Places photos
    console.log('🖼️ Fetching photos from Google Places...');
    
    const enrichedHotels = await Promise.all(
      amadeusHotels.map(async (hotelOffer: any) => {
        const hotel = hotelOffer.hotel;
        const offer = hotelOffer.offers?.[0];

        // ✅ FIX: Parse Amadeus address properly
        const amadeusAddress = hotel.address || {};
        
        // Build street address from lines array
        const streetAddress = Array.isArray(amadeusAddress.lines) 
          ? amadeusAddress.lines.join(', ') 
          : '';
        
        const cityName = amadeusAddress.cityName || '';
        const stateName = amadeusAddress.stateCode || '';
        const countryCode = amadeusAddress.countryCode || '';
        const postalCode = amadeusAddress.postalCode || '';

        // Build full address string
        const fullAmadeusAddress = [
          streetAddress,
          cityName,
          stateName,
          countryCode,
          postalCode
        ].filter(Boolean).join(', ');

        console.log(`📍 Address for ${hotel.name}:`, {
          raw: amadeusAddress,
          parsed: {
            street: streetAddress,
            city: cityName,
            country: countryCode,
            full: fullAmadeusAddress
          }
        });

        // Get photos from Google Places
        let googleData = null;
        try {
          googleData = await googlePlacesService.getHotelPhotos(
            hotel.name,
            cityName || cityCode || ''
          );
        } catch (photoError) {
          console.warn('Failed to get photos for', hotel.name);
        }

        // ✅ Prioritize Google address if available, fallback to Amadeus
        const finalAddress = {
          street: streetAddress || googleData?.address?.split(',')[0] || 'Address not available',
          city: cityName || cityCode || 'City not available',
          state: stateName || '',
          country: countryCode || 'Country not available',
          postalCode: postalCode || '',
          
          // Full formatted address (prioritize Google, fallback to Amadeus)
          full: googleData?.address || fullAmadeusAddress || 'Address not available'
        };

        return {
          hotelId: hotel.hotelId,
          hotelName: hotel.name,
          offerId: offer?.id,
          
          // ✅ Return properly formatted address
          address: finalAddress,
          
          coordinates: {
            latitude: hotel.latitude,
            longitude: hotel.longitude
          },
          
          rating: hotel.rating,
          amenities: hotel.amenities || [],
          
          // Photos from Google Places
          photos: googleData?.photos || [],
          mainPhoto: googleData?.photos?.[0] || null,
          googleRating: googleData?.rating,
          googleReviewCount: googleData?.totalRatings,
          googleAddress: googleData?.address,

          // Pricing from Amadeus
          pricing: {
            currency: offer?.price?.currency || 'USD',
            total: parseFloat(offer?.price?.total || '0'),
            base: parseFloat(offer?.price?.base || '0'),
            taxes: offer?.price?.taxes?.map((tax: any) => ({
              amount: parseFloat(tax.amount || '0'),
              currency: tax.currency,
              code: tax.code,
              included: tax.included
            })) || []
          },

          // Room info
          room: {
            type: offer?.room?.type,
            typeEstimated: offer?.room?.typeEstimated?.category,
            description: offer?.room?.description?.text,
            bedType: offer?.room?.typeEstimated?.bedType,
            beds: offer?.room?.typeEstimated?.beds
          },

          // Policies
          policies: {
            cancellation: offer?.policies?.cancellation,
            checkInTime: offer?.policies?.checkInTime,
            checkOutTime: offer?.policies?.checkOutTime
          },

          available: offer?.available !== false,
          
          // Store raw Amadeus data for debugging
          _amadeus: {
            hotelId: hotel.hotelId,
            offerId: offer?.id,
            chainCode: hotel.chainCode,
            rawAddress: amadeusAddress
          }
        };
      })
    );

    console.log('✅ Enriched', enrichedHotels.length, 'hotels with photos and addresses');

    res.json({
      success: true,
      data: {
        hotels: enrichedHotels,
        totalResults: enrichedHotels.length,
        searchParams: {
          cityCode,
          checkInDate,
          checkOutDate,
          adults: parseInt(adults),
          rooms: parseInt(rooms)
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error searching hotels:', error);
    
    const errorMessage = error.description?.[0]?.detail || 
                        error.response?.body || 
                        error.message || 
                        'Unknown error';
    
    res.status(500).json({
      success: false,
      message: 'Failed to search hotels',
      error: errorMessage,
      details: error.description || null
    });
  }
}
  // Get hotel details (specific offer)
  getHotelDetails = async (req: Request<{}, {}, {}, HotelDetailsQuery>, res: Response): Promise<void> => {
    try {
      const { offerId } = req.query;

      if (!offerId) {
        res.status(400).json({
          success: false,
          message: 'Offer ID is required'
        });
        return;
      }

      // Get offer details from Amadeus
      const offerDetails = await amadeusService.getHotelOffer(offerId);

      if (!offerDetails) {
        res.status(404).json({
          success: false,
          message: 'Hotel offer not found or expired'
        });
        return;
      }

      const hotel = offerDetails.hotel;
      const offer = offerDetails.offers?.[0];

      // Get photos from Google Places
      const googleData = await googlePlacesService.getHotelPhotos(
        hotel.name,
        hotel.address?.cityName || ''
      );

      const hotelDetails = {
        hotelInfo: {
          hotelId: hotel.hotelId,
          hotelName: hotel.name,
          chainCode: hotel.chainCode,
          rating: hotel.rating,
          
          address: {
            street: hotel.address?.lines?.join(', '),
            city: hotel.address?.cityName,
            state: hotel.address?.stateCode,
            country: hotel.address?.countryCode,
            postalCode: hotel.address?.postalCode,
            latitude: hotel.latitude,
            longitude: hotel.longitude
          },

          contact: {
            phone: hotel.contact?.phone,
            fax: hotel.contact?.fax,
            email: hotel.contact?.email
          },

          amenities: hotel.amenities,
          media: hotel.media,

          // Google Places data
          photos: googleData?.photos || [],
          googleRating: googleData?.rating,
          googleReviewCount: googleData?.totalRatings,
          googleAddress: googleData?.address
        },

        offer: {
          id: offer?.id,
          checkInDate: offer?.checkInDate,
          checkOutDate: offer?.checkOutDate,
          roomQuantity: offer?.roomQuantity,
          
          room: {
            type: offer?.room?.type,
            typeEstimated: offer?.room?.typeEstimated,
            description: offer?.room?.description,
            bedType: offer?.room?.typeEstimated?.bedType,
            beds: offer?.room?.typeEstimated?.beds
          },

          guests: offer?.guests,
          
          price: {
            currency: offer?.price?.currency,
            total: offer?.price?.total,
            base: offer?.price?.base,
            taxes: offer?.price?.taxes,
            variations: offer?.price?.variations
          },

          policies: {
            cancellation: offer?.policies?.cancellation,
            paymentType: offer?.policies?.paymentType,
            guarantee: offer?.policies?.guarantee,
            deposit: offer?.policies?.deposit,
            prepay: offer?.policies?.prepay,
            holdTime: offer?.policies?.holdTime,
            checkInTime: offer?.policies?.checkInTime,
            checkOutTime: offer?.policies?.checkOutTime
          },

          available: offer?.available,
          self: offer?.self
        }
      };

      res.json({
        success: true,
        data: hotelDetails,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Error getting hotel details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get hotel details',
        error: error.response?.data || error.message || 'Unknown error'
      });
    }
  }

  // CREATE DRAFT BOOKING
createHotelDraftBooking = async (req: Request<{}, {}, BookingRequest>, res: Response): Promise<void> => {
  try {
    const userId = req.session.userId;
    const {
      tripId,
      offerId,
      hotelDetails,
      stayDetails,
      leadGuest,
      pricing,
      policies,
      specialRequests
    } = req.body;

    if (!tripId || !userId || !offerId || !hotelDetails || !stayDetails || !pricing) {
      res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
      return;
    }

    // 🔎 Revalidate offer before draft
    const offerCheck = await amadeusService.getHotelOffer(offerId);

    if (!offerCheck || !offerCheck.offers?.[0]) {
      res.status(400).json({
        success: false,
        message: 'Hotel offer is no longer available'
      });
      return;
    }

    const parentBooking = await getOrCreateParentBooking(
      userId.toString(),
      tripId,
      pricing.currency || 'INR'
    );

    const hotelBookingRef = generateBookingReference('HB');

    // Extract clean address
    let addressStreet = '';
    let addressCity = '';
    let addressCountry = '';

    if (typeof hotelDetails.address === 'object') {
      addressStreet = hotelDetails.address.full || hotelDetails.address.street || '';
      addressCity = hotelDetails.address.city || '';
      addressCountry = hotelDetails.address.country || '';
    } else if (typeof hotelDetails.address === 'string') {
      addressStreet = hotelDetails.address;
    }

    const hotelBooking = new HotelBooking({
      bookingId: parentBooking._id,
      hotelBookingRef,

      apiDetails: {
        hotelId: hotelDetails.hotelId,
        bookingSource: 'amadeus',
        offerId
      },

      hotelDetails: {
        hotelId: hotelDetails.hotelId,
        hotelName: hotelDetails.hotelName,
        address: {
          street: addressStreet || 'Address not available',
          city: addressCity || 'City not available',
          country: addressCountry || 'Country not available'
        },
        starRating: hotelDetails.starRating
      },

      stayDetails: {
        checkIn: new Date(stayDetails.checkIn),
        checkOut: new Date(stayDetails.checkOut),
        nights: stayDetails.nights,
        searchParams: stayDetails.searchParams,
        rooms: stayDetails.rooms
      },

      leadGuest: {
        travelerId: leadGuest?.travelerId
      },

      pricing,

      policies,
      services: { specialRequests },

      status: 'draft'   // 🟢 DRAFT
    });

    await hotelBooking.save();
     await linkServiceToBooking(
      parentBooking._id,
      'hotels',
      hotelBooking._id,
      pricing.totalPrice
    );

    // ✅ Link the hotel booking to parent booking
    parentBooking.services.hotels.push(hotelBooking._id);
    await parentBooking.save();

    console.log('🏨 Hotel booking created:', hotelBooking._id);
    console.log('🔗 Linked to parent booking:', parentBooking._id);

    res.status(201).json({
      success: true,
      data: {
        hotelBookingId: hotelBooking._id,
        hotelBookingRef,
        parentBookingId: parentBooking._id,
        amount: pricing.totalPrice,
        currency: pricing.currency,
        status: hotelBooking.status,
        message: 'Hotel booking created successfully and linked to parent booking'
      }
    });

  } catch (error) {
    console.error('❌ Error creating hotel booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create hotel booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// CONFIRM BOOKING AFTER PAYMENT
confirmHotelBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bookingId, paymentDetails } = req.body;

    if (!bookingId || !paymentDetails) {
      res.status(400).json({
        success: false,
        message: 'Booking ID and payment details required'
      });
      return;
    }

    const booking = await HotelBooking.findById(bookingId);

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
      return;
    }

    if (booking.status !== 'pending') {
      res.status(400).json({
        success: false,
        message: 'Invalid booking state'
      });
      return;
    }

    const { title, firstName, lastName, phone, email } = booking.leadGuest;

    if (!title || !firstName || !lastName || !phone || !email) {
      res.status(400).json({
        success: false,
        message: 'Incomplete guest details'
      });
      return;
    }

    const offerCheck = await amadeusService.getHotelOffer(
      booking.apiDetails.offerId
    );

    if (!offerCheck || !offerCheck.offers?.[0]?.available) {
      booking.status = 'payment_failed';
      await booking.save();

      res.status(400).json({
        success: false,
        message: 'Offer expired'
      });
      return;
    }

    const amadeusBooking = await amadeusService.bookHotel({
      offerId: booking.apiDetails.offerId,
      guests: [{
        tid: 1,
        title,
        firstName,
        lastName,
        phone,
        email
      }],
      payments: [paymentDetails]
    });

    const confirmation = amadeusBooking[0];

    booking.status = 'confirmed';
    booking.confirmation = {
      confirmationNumber: confirmation.id,
      supplierReference: confirmation.providerConfirmationId,
      confirmedAt: new Date()
    };

    await booking.save();

    res.json({
      success: true,
      message: 'Hotel booking confirmed',
      data: {
        bookingId: booking._id,
        confirmationNumber: confirmation.id
      }
    });

  } catch (error: any) {
    console.error('Confirm booking error:', error);

    res.status(500).json({
      success: false,
      message: 'Booking confirmation failed',
      error: error.message
    });
    return;
  }
};

  // Get hotel booking by reference
  getHotelBooking = async (req: Request<{ bookingRef: string }>, res: Response): Promise<void> => {
    try {
      const { bookingRef } = req.params;

      const hotelBooking = await HotelBooking.findOne({
        hotelBookingRef: bookingRef
      })
        .populate('leadGuest.travelerId')
        .populate('stayDetails.rooms.assignedTravelers.travelerId');

      if (!hotelBooking) {
        res.status(404).json({
          success: false,
          message: 'Hotel booking not found'
        });
        return;
      }

      res.json({
        success: true,
        data: hotelBooking,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting hotel booking:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get hotel booking',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update booking status
  updateBookingStatus = async (
    req: Request<{ bookingRef: string }, {}, { status: string; confirmationNumber?: string }>,
    res: Response
  ): Promise<void> => {
    try {
      const { bookingRef } = req.params;
      const { status, confirmationNumber } = req.body;

      const validStatuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'completed'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
        return;
      }

      const updateData: any = { status };
      if (confirmationNumber) {
        updateData['confirmation.confirmationNumber'] = confirmationNumber;
      }

      const hotelBooking = await HotelBooking.findOneAndUpdate(
        { hotelBookingRef: bookingRef },
        updateData,
        { new: true }
      );

      if (!hotelBooking) {
        res.status(404).json({
          success: false,
          message: 'Hotel booking not found'
        });
        return;
      }

      res.json({
        success: true,
        data: hotelBooking,
        message: `Booking status updated to ${status}`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update booking status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get user's hotel bookings
  getUserHotelBookings = async (
    req: Request<{ userId: string }, {}, {}, { status?: string; page?: string; limit?: string }>,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const { status, page = '1', limit = '10' } = req.query;

      const query: any = {};
      if (status) query.status = status;

      // Find parent bookings for this user
      const parentBookings = await Booking.find({ userId }).select('_id') as Array<{ _id: any }>;
      const bookingIds = parentBookings.map(b => b._id);

      query.bookingId = { $in: bookingIds };

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      const hotelBookings = await HotelBooking.find(query)
        .populate('leadGuest.travelerId')
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum);

      const total = await HotelBooking.countDocuments(query);

      res.json({
        success: true,
        data: {
          bookings: hotelBookings,
          pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalBookings: total,
            hasNextPage: pageNum * limitNum < total,
            hasPrevPage: pageNum > 1
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting user hotel bookings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get hotel bookings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new HotelController();
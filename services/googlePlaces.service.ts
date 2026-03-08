import axios from 'axios';
import mongoose from 'mongoose';

interface HotelPhotoCache {
  hotelName: string;
  cityName: string;
  placeId?: string;
  photos: string[];
  rating?: number;
  totalRatings?: number;
  address?: string;
  lastUpdated: Date;
}

// Simple in-memory cache (you can use Redis in production)
const photoCache = new Map<string, HotelPhotoCache>();

class GooglePlacesService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY!;
  }

  // Get cache key
  private getCacheKey(hotelName: string, cityName: string): string {
    return `${hotelName.toLowerCase()}_${cityName.toLowerCase()}`;
  }

  // Check if cache is still valid (7 days)
  private isCacheValid(cached: HotelPhotoCache): boolean {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return cached.lastUpdated > sevenDaysAgo;
  }

  async getHotelPhotos(hotelName: string, cityName: string): Promise<HotelPhotoCache | null> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(hotelName, cityName);
      const cached = photoCache.get(cacheKey);
      
      if (cached && this.isCacheValid(cached)) {
        console.log('Using cached photos for:', hotelName);
        return cached;
      }

      // 1. Find the place
      const searchResponse = await axios.get(
        'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
        {
          params: {
            input: `${hotelName} ${cityName}`,
            inputtype: 'textquery',
            fields: 'place_id,name',
            key: this.apiKey
          }
        }
      );

      const placeId = searchResponse.data.candidates?.[0]?.place_id;
      
      if (!placeId) {
        console.log('No place found for:', hotelName);
        return null;
      }

      // 2. Get place details with photos
      const detailsResponse = await axios.get(
        'https://maps.googleapis.com/maps/api/place/details/json',
        {
          params: {
            place_id: placeId,
            fields: 'photos,rating,user_ratings_total,formatted_address',
            key: this.apiKey
          }
        }
      );

      const details = detailsResponse.data.result;
      const photos = details?.photos || [];

      // 3. Generate photo URLs
      const photoUrls = photos.slice(0, 10).map((photo: any) => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${this.apiKey}`
      );

      const result: HotelPhotoCache = {
        hotelName,
        cityName,
        placeId,
        photos: photoUrls,
        rating: details?.rating,
        totalRatings: details?.user_ratings_total,
        address: details?.formatted_address,
        lastUpdated: new Date()
      };

      // Cache it
      photoCache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Google Places error:', error);
      return null;
    }
  }

  // Batch get photos for multiple hotels
  async batchGetHotelPhotos(hotels: Array<{ name: string; city: string }>): Promise<Map<string, HotelPhotoCache>> {
    const results = new Map<string, HotelPhotoCache>();

    await Promise.all(
      hotels.map(async (hotel) => {
        const photos = await this.getHotelPhotos(hotel.name, hotel.city);
        if (photos) {
          results.set(this.getCacheKey(hotel.name, hotel.city), photos);
        }
      })
    );

    return results;
  }
}

export default new GooglePlacesService();
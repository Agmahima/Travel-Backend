// src/routes/searchResultRoutes.ts
import { Router } from 'express';
import { SearchResultController } from '../controllers/SearchResultController';
// import { authMiddleware } from '../middleware/auth';
import { authenticate } from '../middleware/authenticate'; // Adjust the path as necessary


const router = Router();
const searchResultController = new SearchResultController();

// Save search results
router.post('/flights/save', authenticate, searchResultController.saveFlightSearchResults);
router.post('/hotels/save', authenticate, searchResultController.saveHotelSearchResults);

// Create bookings from search results
router.post('/flights/create-booking', authenticate, searchResultController.createFlightBookingFromSearch);
router.post('/hotels/create-booking', authenticate, searchResultController.createHotelBookingFromSearch);

// Get pending bookings for consolidation
router.get('/pending/:tripId/:userId', authenticate, searchResultController.getPendingBookingsForTrip);

export { router as searchResultRoutes };
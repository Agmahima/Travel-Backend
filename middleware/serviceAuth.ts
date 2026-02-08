import { Request, Response, NextFunction } from 'express';
import { authenticate, AuthenticatedRequest } from './authenticate';

export const serviceAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Check for service key first (for internal service-to-service calls)
  const serviceKey = req.headers['x-service-key'] as string;
  const expectedKey = process.env.SERVICE_API_KEY;
  
  console.log('🔐 serviceAuth check:', {
    path: req.path,
    hasServiceKey: !!serviceKey,
    expectedKeyExists: !!expectedKey,
    keysMatch: serviceKey === expectedKey,
    hasAuthHeader: !!req.headers.authorization
  });
  
  // If service key matches, it's an internal call - allow it
  if (serviceKey && expectedKey && serviceKey === expectedKey) {
    console.log('✅ Internal service call authenticated via service key');
    return next();
  }
  
  // Otherwise, fall back to regular user authentication
  console.log('🔄 No valid service key, checking user authentication');
  authenticate(req, res, next);
};
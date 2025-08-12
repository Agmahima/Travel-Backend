// middleware/authenticate.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ message: "No authorization header provided" });
      return;
    }
    
    // Check if header starts with "Bearer "
    if (!authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Invalid authorization format. Use 'Bearer <token>'" });
      return;
    }
    
    // Extract token
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      res.status(401).json({ message: "No token provided" });
      return;
    }
    
    // Verify JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      res.status(500).json({ message: "Server configuration error" });
      return;
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: string;
    };
    
    // Add userId to request object
    req.userId = decoded.userId;
    next();
    
  } catch (err) {
    console.error("Authentication error:", err);
    
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token has expired" });
      return;
    }
    
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ message: "Invalid token" });
      return;
    }
    
    res.status(500).json({ message: "Authentication failed" });
  }
};
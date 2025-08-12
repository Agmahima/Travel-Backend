import { Request, Response } from "express";
import { insertUserSchema } from "../shared/schema";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";
import bcrypt from "bcrypt";
import { ZodError } from "zod";

export const userController = {
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      
      // Check if username or email already exists
      const existingUsername = await User.findOne({
        username: validatedData.username,
      });
      if (existingUsername) {
        res.status(400).json({ message: "Username already exists" });
        return;
      }
      
      const existingEmail = await User.findOne({ email: validatedData.email });
      if (existingEmail) {
        res.status(400).json({ message: "Email already exists" });
        return;
      }
      
      // DON'T hash password here - let the pre-save middleware handle it
      const newUser = await User.create({
        ...validatedData,
        // password will be automatically hashed by the pre-save middleware
      });
      
      // Generate JWT token
      const token = generateToken(newUser._id.toString());
      
      // Set session
      req.session.userId = newUser._id.toString();
      
      const userResponse = newUser.toObject?.() ?? newUser;
      delete userResponse.password;
      
      res.status(201).json({
        token,
        user: userResponse
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  },

  login: async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;
    console.log("Login attempt with username:", username);
    
    try {
      // Find user by username or email
      const user = await User.findOne({
        $or: [
          { username: username },
          { email: username } // Allow login with email too
        ]
      });
      
      if (!user) {
        console.log("User not found");
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }
      
      console.log("User found, comparing passwords...");
      console.log("Plain password:", password);
      console.log("Hashed password from DB:", user.password);
      
      // Compare password with hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password match result:", isMatch);
      
      if (!isMatch) {
        console.log("Password mismatch");
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }
      
      // Generate JWT token
      const token = generateToken(user._id.toString());
      
      // Set session
      req.session.userId = user._id.toString();
      
      // Return token and user info (without password)
      const userResponse = user.toObject();
      delete userResponse.password;
      
      res.status(200).json({
        token,
        user: userResponse
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Login error" });
    }
  },

  logout: (req: Request, res: Response): void => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: "Logout failed" });
        return;
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  },

  getCurrentUser: async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if we're using JWT (from middleware) or session
      const userId = (req as any).user?.id || req.session.userId;
      
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      
      const userResponse = user.toObject();
      delete userResponse.password;
      res.status(200).json(userResponse);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  },
};
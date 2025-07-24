import { Request,Response } from "express";

import { insertUserSchema } from "../shared/schema";
import  User  from "../models/User";
// const { User } = require("../models/User"); // Adjust the path as necessary

import { ZodError } from "zod";

export const userController ={
    // register: async(req:Request, res:Response) : Promise<void> => {
    //     try{
    //     const validatedData = insertUserSchema.parse(req.body);

    //     const existingUsername = await User.findOne({ username: validatedData.username });
    //     if (existingUsername) {
    //         res.status(400).json({message: "Username already exists"});
    //         return;
    //     }

    //     const existingEmail = await User.findOne({email: validatedData.email});
    //     if ( existingEmail){
    //         res.status(400).json({message: "Email already exists"});
    //         return;
    //     }

    //     const newUser = await User.create(validatedData);
    //     req.session.userId = newUser.id; // Assuming you are using express-session
        
    //     const userResponse = newUser.toObject();
    //     delete userResponse.password; // Remove password from response
    //     res.status(201).json(userResponse);
    //     } catch (error) {
    //         if (error instanceof ZodError) {
    //             res.status(400).json({ message: error.errors });
    //         } else {
    //             console.log("there is an error")
    //             res.status(500).json({ message: "Internal Server Error" });
    //         }
    //     }
    // },

    register: async (req: Request, res: Response): Promise<void> => {
        try {
          const validatedData = insertUserSchema.parse(req.body);
          console.log("Validated data:", validatedData); // <- log the validated data
            // Check if username or email already exists

      
          const existingUsername = await User.findOne({ username: validatedData.username });
          if (existingUsername) {
            res.status(400).json({ message: "Username already exists" });
            return;
          }
      
          const existingEmail = await User.findOne({ email: validatedData.email });
          if (existingEmail) {
            res.status(400).json({ message: "Email already exists" });
            return;
          }
      
          const newUser = await User.create(validatedData);
      
          req.session.userId = newUser._id.toString(); // <- safer
      
          const userResponse = newUser.toObject?.() ?? newUser;
          delete userResponse.password;
      
          res.status(201).json(userResponse);
        } catch (error) {
          console.error("Registration error:", error); // <- shows actual issue
          if (error instanceof ZodError) {
            res.status(400).json({ message: error.errors });
          } else {
            res.status(500).json({ message: "Internal Server Error" });
          }
        }
      }
    ,      
    login: async(req:Request, res:Response) :Promise<void> => {
        try{
            const {username, password} = req.body;
            console.log("Login attempt with username:", username); // <- log the username
            const user = await User.findOne({username});
            if(!user || user.password !==password){
                res.status(401).json({message : "Invalid credentials" });
                return;
            }

            req.session.userId = user._id; // Assuming you are using express-session
            const userResponse = user.toObject();
            delete userResponse.password; // Remove password from response
            res.status(200).json(userResponse);
        }catch(error){
            res.status(400).json({message: error instanceof Error ? error.message : "Internal Server Error"});
        }
    },

    logout: (req:Request, res:Response) : void =>{
        req.session.destroy(err=> {
            if(err){
                res.status(500).json({message: "Logout failed"});
                return;
            }
            res.status(200).json({message: " Logged out successfully"});

        });
    },

    getCurrentUser: async(req:Request, res:Response) : Promise<void> => {
        try{
            if(!req.session.userId){
                res.status(400).json({message: "User ID is missong in session" });
                return;
            }
        const user= await User.findById(req.session.userId);
        if(!user){
            res.status(404).json({message: "User not found"});
            return;
        }

        const userResponse = user.toObject();
        delete userResponse.password; // Remove password from response
        res.status(200).json(userResponse);
        }catch(error){
            res.status(500).json({message: error instanceof Error ? error.message : "Internal Server Error"});
        }
    }



    }

require('dotenv').config();
import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { Express } from "express-serve-static-core";
import flightRoutes from "./routes/flightRoutes"; // Adjust the path if necessary
import { authenticate } from "./middleware/authenticate";
// const itineraryDaysRoutes = require('./routes/itineraryRoutes');
// const itineraryRoutes = require("./routes/itineraryRoutes"); // Adjust the path if necessary
import itineraryRoutes from "./routes/itineraryRoutes"; // Adjust the path if necessary

const { baseDbConnection } = require("./dbConnection");

const app = express();

// Middleware to parse JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use('/api/itinerary-days', itineraryRoutes);

// Request logger middleware for /api routes
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json.bind(res) as typeof res.json;

  res.json = function (bodyJson, ...args) {
    if (res.headersSent) return res; // Prevent sending headers after response
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;

    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      // Uncomment this if you want to log to console
      // console.log(logLine);
    }
  });

  next();
});

// Connect to MongoDB
baseDbConnection.on('connected', () => console.log('Connected to dev-base database'));
baseDbConnection.on('error', (err: any) =>
  console.error('Error connecting to dev-base database:', err)
);

// Initialize Amadeus client
var amadeus = new (require("amadeus"))({
  clientId: process.env.AMADEUS_CLIENT_ID || "missing-client-id",
  clientSecret: process.env.AMADEUS_CLIENT_SECRET || "missing-client-secret"
});

// Function to serve static files (no Vite)
function serveStatic(app: Express) {
  app.use(express.static("public")); // Replace 'public' if static assets live elsewhere
}

// Start app
(async () => {
  try {
    // Register your other routes (e.g. /api/auth etc.)
    await registerRoutes(app);

    // Attach flight routes BEFORE the error handler
    app.use('/api/flights', flightRoutes);

    // Global error handler (should always come last)
    app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
      if (res.headersSent) return;
      const status = err.status || 500;
      res.status(status).json({ message: err.message || "Internal Server Error" });
    });

    // Serve static files
    serveStatic(app);

    const port = 5000;
    app.listen(port, "localhost", () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log(`Failed to start server: ${(error as Error).message}`);
    process.exit(1);
  }
})();

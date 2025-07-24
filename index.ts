require('dotenv').config();
import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { Express } from "express-serve-static-core";
import  flightRoutes from "./routes/flightRoutes"; // Adjust the path as necessary

var amadeus = require("amadeus");

const { baseDbConnection } = require("./dbConnection");

const app = express();

// Middleware to parse JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logger middleware for /api routes
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json.bind(res) as typeof res.json;

  res.json = function (bodyJson, ...args) {
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

      // log(logLine); // You can uncomment this to log the requests
    }
  });

  next();
});

(async () => {
  try {
    // Register API routes
    await registerRoutes(app);

    // Global error handler
    app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || 500;
      res.status(status).json({ message: err.message || "Internal Server Error" });
    });

    // Serve static files in production
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

app.use('/api/flights', flightRoutes);



baseDbConnection.on('connected', () => console.log('Connected to dev-base database'));

baseDbConnection.on('error', (err: any) =>
  console.error('Error connecting to dev-base database:', err)
);


var amadeus = new amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID || "missing-client-id",
  clientSecret: process.env.AMADEUS_CLIENT_SECRET || "missing-client-secret",
  // serverUrl: process.env.AMADEUS_SERVER_URL || "https://test.api.amadeus.com"
});

// amadeus.shopping.flightOffersSearch.get({
//   originLocationCode: 'SYD',
//   destinationLocationCode: 'BKK',
//   departureDate: '2025-07-07',
//   adults: 1,
// }).then(function ( response: { data: any; } ) {
//   console.log(response.data);
// }).catch(function (responseError: any) {
//   console.error("Error fetching flight offers:", responseError);

// });
  
// Function to serve static files (no Vite)
function serveStatic(app: Express) {
  // Replace 'public' with the directory where your static assets are located
  app.use(express.static("public"));
}

require('dotenv').config();
import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { Express } from "express-serve-static-core";

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

// Function to serve static files (no Vite)
function serveStatic(app: Express) {
  // Replace 'public' with the directory where your static assets are located
  app.use(express.static("public"));
}

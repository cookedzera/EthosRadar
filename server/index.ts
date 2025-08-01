import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
// Optimize request parsing limits for better performance
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Add CORS headers for Farcaster crawler
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
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

      log(logLine);
    }
  });

  next();
});

// Basic root endpoint for quick status check
app.get('/_status', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'EthosRadar',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint for deployment readiness checks
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || '5000'
  });
});

// Simple fallback for cloud-bg.png - serve unified-bg.png temporarily
app.get('/cloud-bg.png', (req, res) => {
  const fallbackPath = path.join(process.cwd(), 'public', 'unified-bg.png');
  res.sendFile(fallbackPath, (err) => {
    if (err) {
      console.log('Error serving fallback background:', err);
      res.status(404).send('Background image not found');
    }
  });
});

// Readiness check endpoint
app.get('/ready', (req, res) => {
  res.status(200).json({ 
    status: 'ready',
    timestamp: new Date().toISOString()
  });
});

// Explicit static asset serving for critical WebP/PNG files
app.get('/unified-bg.webp', (req, res) => {
  res.sendFile(path.resolve(import.meta.dirname, "..", "public", "unified-bg.webp"));
});

app.get('/unified-bg.png', (req, res) => {
  res.sendFile(path.resolve(import.meta.dirname, "..", "public", "unified-bg.png"));
});

app.get('/logo.webp', (req, res) => {
  res.sendFile(path.resolve(import.meta.dirname, "..", "public", "logo.webp"));
});

app.get('/logo.png', (req, res) => {
  res.sendFile(path.resolve(import.meta.dirname, "..", "public", "logo.png"));
});

app.get('/icon.webp', (req, res) => {
  res.sendFile(path.resolve(import.meta.dirname, "..", "public", "icon.webp"));
});

app.get('/icon.png', (req, res) => {
  res.sendFile(path.resolve(import.meta.dirname, "..", "public", "icon.png"));
});

app.get('/embed-preview.png', (req, res) => {
  res.sendFile(path.resolve(import.meta.dirname, "..", "public", "embed-preview.png"));
});

(async () => {
  try {
    log("Starting server initialization...");
    
    const server = await registerRoutes(app);
    log("Routes registered successfully");

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      log(`Error handled: ${status} - ${message}`);
      res.status(status).json({ message });
      // Server error handled
      // Don't re-throw the error to prevent crashes
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      // Serve static files from public directory in development
      app.use(express.static(path.resolve(import.meta.dirname, "..", "public")));
      await setupVite(app, server);
      log("Development mode: Vite setup completed");
    } else {
      serveStatic(app);
      log("Production mode: Static files setup completed");
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
      log("Server initialization completed successfully");
    });

    // Handle server errors
    server.on('error', (error: any) => {
      log(`Server error: ${error.message}`);
      if (error.code === 'EADDRINUSE') {
        log(`Port ${port} is already in use`);
      }
      process.exit(1);
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      log('SIGINT received, shutting down gracefully');
      server.close(() => {
        log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    log(`Failed to initialize server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('Server initialization error:', error);
    process.exit(1);
  }
})();

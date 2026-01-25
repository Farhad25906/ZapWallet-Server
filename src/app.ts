import express, { Request, Response } from "express";
import { router } from "./app/routes";
import cors from "cors";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import cookieParser from "cookie-parser";
import compression from "compression";
import { apiLimiter } from "./app/middlewares/rateLimiter";
import { envVariables } from "./app/config/env";

const app = express();

// Compression middleware
app.use(compression());

// Body parsing with size limits
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// CORS configuration from environment variable
app.use(
  cors({
    origin: envVariables.FRONTEND_URL,
    credentials: true,
  })
);

app.use(cookieParser());

// Apply general rate limiting to all routes
app.use("/api/v1", apiLimiter);

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Digital Payment System Backend",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;


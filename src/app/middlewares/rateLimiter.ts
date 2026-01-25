import rateLimit from "express-rate-limit";

/**
 * Rate limiter for login attempts
 * Strict limit to prevent brute force attacks
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        success: false,
        message: "Too many login attempts. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
});

/**
 * Rate limiter for OTP requests
 * Prevents OTP spam
 */
export const otpLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // 3 OTP requests per minute
    message: {
        success: false,
        message: "Too many OTP requests. Please wait before requesting again.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for registration
 * Prevents automated account creation
 */
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour per IP
    message: {
        success: false,
        message: "Too many registration attempts. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for transaction operations
 * Prevents rapid transaction spam
 */
export const transactionLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 transactions per minute
    message: {
        success: false,
        message: "Too many transactions. Please slow down.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * General API rate limiter
 * Applied to all routes as a baseline
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict rate limiter for sensitive admin operations
 */
export const adminLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
    message: {
        success: false,
        message: "Too many admin requests. Please slow down.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

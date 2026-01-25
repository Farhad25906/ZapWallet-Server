
import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType, ZodIssue } from "zod";
import { StatusCodes } from "http-status-codes";

/**
 * Middleware to validate request data against a Zod schema
 * Supports validation of body, query, and params
 */
export const validateRequest = (zodSchema: ZodType) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Handle multipart/form-data with JSON in data field
            if (req.body.data) {
                req.body = JSON.parse(req.body.data);
            }

            // Validate against schema
            // If schema has body/query/params structure, validate all
            // Otherwise, just validate body
            const dataToValidate =
                "body" in (zodSchema as any)._def || "query" in (zodSchema as any)._def
                    ? {
                        body: req.body,
                        query: req.query,
                        params: req.params,
                    }
                    : req.body;

            const validated = await zodSchema.parseAsync(dataToValidate);

            // Update request with validated data
            if (typeof validated === "object" && validated !== null) {
                if ("body" in validated) req.body = (validated as any).body;
                if ("query" in validated) req.query = (validated as any).query;
                if ("params" in validated) req.params = (validated as any).params;
            } else {
                req.body = validated;
            }

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = (error.issues as ZodIssue[]).map((err: ZodIssue) => ({
                    field: err.path.join("."),
                    message: err.message,
                }));

                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Validation failed",
                    errors: formattedErrors,
                });
            }

            // Pass other errors to global error handler
            next(error);
        }
    };
};
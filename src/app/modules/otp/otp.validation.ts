import { z } from "zod";

// Send OTP validation schema
export const sendOtpSchema = z.object({
    body: z.object({
        phone: z
            .string({ message: "Phone number is required" })
            .regex(/^\+88\d{11}$/, {
                message: "Phone must start with +88 and be 13 digits total",
            }),
    }),
});

// Verify OTP validation schema
export const verifyOtpSchema = z.object({
    body: z.object({
        phone: z
            .string({ message: "Phone number is required" })
            .regex(/^\+88\d{11}$/, {
                message: "Phone must start with +88 and be 13 digits total",
            }),

        otp: z
            .string({ message: "OTP is required" })
            .length(6, { message: "OTP must be exactly 6 digits" })
            .regex(/^\d+$/, { message: "OTP must contain only numbers" }),
    }),
});

export const OtpValidation = {
    sendOtpSchema,
    verifyOtpSchema,
};

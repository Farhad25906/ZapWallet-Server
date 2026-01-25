import { z } from "zod";

// Login validation schema
export const loginSchema = z.object({
    body: z.object({
        phone: z
            .string({ message: "Phone number is required" })
            .regex(/^\+88\d{11}$/, {
                message: "Phone must start with +88 and be 13 digits total",
            }),
        pin: z
            .string({ message: "PIN is required" })
            .min(6, { message: "PIN must be at least 6 digits" })
            .max(6, { message: "PIN must be exactly 6 digits" })
            .regex(/^\d+$/, { message: "PIN must contain only numbers" }),
    }),
});

// Reset PIN validation schema
export const resetPinSchema = z.object({
    body: z
        .object({
            oldPin: z
                .string({ message: "Old PIN is required" })
                .min(6, { message: "PIN must be 6 digits" })
                .max(6, { message: "PIN must be 6 digits" })
                .regex(/^\d+$/, { message: "PIN must contain only numbers" }),

            newPin: z
                .string({ message: "New PIN is required" })
                .min(6, { message: "PIN must be 6 digits" })
                .max(6, { message: "PIN must be 6 digits" })
                .regex(/^\d+$/, { message: "PIN must contain only numbers" }),

            confirmNewPin: z.string({ message: "Please confirm your new PIN" }),
        })
        .refine((data) => data.newPin === data.confirmNewPin, {
            message: "PINs do not match",
            path: ["confirmNewPin"],
        })
        .refine((data) => data.oldPin !== data.newPin, {
            message: "New PIN must be different from old PIN",
            path: ["newPin"],
        }),
});

export const AuthValidation = {
    loginSchema,
    resetPinSchema,
};

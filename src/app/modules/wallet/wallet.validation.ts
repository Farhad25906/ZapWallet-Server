import { z } from "zod";

// Send Money validation schema
export const sendMoneySchema = z.object({
    body: z.object({
        toWalletNumber: z
            .string({ message: "Recipient phone number is required" })
            .regex(/^\+88\d{11}$/, {
                message: "Phone must start with +88 and be 13 digits total",
            }),

        amount: z
            .number({ message: "Amount must be a number" })
            .positive({ message: "Amount must be greater than 0" })
            .min(100, { message: "Minimum amount is ৳100" })
            .max(1000000, { message: "Maximum amount is ৳1,000,000" })
            .multipleOf(0.01, { message: "Amount can have at most 2 decimal places" }),
    }),
});

// Cash In validation schema (for agents)
export const cashInSchema = z.object({
    body: z.object({
        userPhone: z
            .string({ message: "User phone number is required" })
            .regex(/^\+88\d{11}$/, {
                message: "Phone must start with +88 and be 13 digits total",
            }),

        amount: z
            .number({ message: "Amount must be a number" })
            .positive({ message: "Amount must be greater than 0" })
            .min(100, { message: "Minimum amount is ৳100" })
            .max(500000, { message: "Maximum amount is ৳500,000" }),
    }),
});

// Cash Out validation schema
export const cashOutSchema = z.object({
    body: z.object({
        agentPhone: z
            .string({ message: "Agent phone number is required" })
            .regex(/^\+88\d{11}$/, {
                message: "Phone must start with +88 and be 13 digits total",
            }),

        amount: z
            .number({ message: "Amount must be a number" })
            .positive({ message: "Amount must be greater than 0" })
            .min(100, { message: "Minimum amount is ৳100" })
            .max(500000, { message: "Maximum amount is ৳500,000" }),
    }),
});

// Withdraw Money validation schema (for agents)
export const withdrawMoneySchema = z.object({
    body: z.object({
        amount: z
            .number({ message: "Amount must be a number" })
            .positive({ message: "Amount must be greater than 0" })
            .min(1000, { message: "Minimum withdrawal is ৳1,000" })
            .max(500000, { message: "Maximum withdrawal is ৳500,000" }),

        bankAccount: z
            .object({
                accountNumber: z
                    .string({ message: "Account number is required" })
                    .min(10, { message: "Account number must be at least 10 digits" })
                    .max(20, { message: "Account number cannot exceed 20 digits" }),

                bankName: z
                    .string({ message: "Bank name is required" })
                    .min(2, { message: "Bank name is required" }),

                accountHolderName: z
                    .string({ message: "Account holder name is required" })
                    .min(2, { message: "Account holder name is required" }),
            })
            .optional(),
    }),
});

export const WalletValidation = {
    sendMoneySchema,
    cashInSchema,
    cashOutSchema,
    withdrawMoneySchema,
};

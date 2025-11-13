import z from "zod";
import { Role } from "./user.interface";

const agentInfoSchema = z.object({
  tinId: z
    .string({ message: "TIN ID must be string" })
    .regex(/^\d{10}$|^\d{13}$|^\d{17}$/, {
      message: "TIN ID must be 10, 13, or 17 digits long.",
    }),
});

export const createUserZodSchema = z
  .object({
    name: z
      .string({ message: "Name must be string" })
      .min(2, { message: "Name must be at least 2 characters long." })
      .max(50, { message: "Name cannot exceed 50 characters." }),

    email: z
      .string({ message: "Email must be string" })
      .email({ message: "Invalid email address format." })
      .min(5, { message: "Email must be at least 5 characters long." })
      .max(100, { message: "Email cannot exceed 100 characters." }),

    pin: z
      .number({ message: "PIN must be a number" })
      .min(1000, { message: "PIN must be 4 digits." })
      .max(9999, { message: "PIN must be 4 digits." }),

    phone: z
      .string({ message: "Phone Number must be string" })
      .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
        message:
          "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
      }),

    nid: z
      .string({ message: "NID must be string" })
      .regex(/^\d{10}$|^\d{13}$|^\d{17}$/, {
        message: "NID must be 10, 13, or 17 digits long.",
      }),

    role: z.nativeEnum(Role).default(Role.USER).optional(),
    picture: z.string().url().optional(),
    address: z.string().max(200).optional(),
    agentInfo: agentInfoSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.role === Role.AGENT && !data.agentInfo) {
        return false;
      }
      return true;
    },
    {
      message: "Agent information is required when role is 'agent'",
      path: ["agentInfo"],
    }
  )
  .refine(
    (data) => {
      if (data.role !== Role.AGENT && data.agentInfo) {
        return false;
      }
      return true;
    },
    {
      message: "Agent information should only be provided for agent role",
      path: ["agentInfo"],
    }
  );

export const updateUserZodSchema = z
  .object({
    name: z
      .string({ message: "Name must be string" })
      .min(2, { message: "Name must be at least 2 characters long." })
      .max(50, { message: "Name cannot exceed 50 characters." })
      .optional(),

    email: z
      .string({ message: "Email must be string" })
      .email({ message: "Invalid email address format." })
      .min(5, { message: "Email must be at least 5 characters long." })
      .max(100, { message: "Email cannot exceed 100 characters." })
      .optional(),

    pin: z
      .number({ message: "PIN must be a number" })
      .min(1000, { message: "PIN must be 4 digits." })
      .max(9999, { message: "PIN must be 4 digits." })
      .optional(),

    phone: z
      .string({ message: "Phone Number must be string" })
      .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
        message:
          "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
      })
      .optional(),

    nid: z
      .string({ message: "NID must be string" })
      .regex(/^\d{10}$|^\d{13}$|^\d{17}$/, {
        message: "NID must be 10, 13, or 17 digits long.",
      })
      .optional(),

    role: z.nativeEnum(Role).optional(),
    picture: z.string().optional(),
    address: z.string().max(200).optional(),
    agentInfo: agentInfoSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.role === Role.AGENT && data.agentInfo && !data.agentInfo.tinId) {
        return false;
      }
      return true;
    },
    {
      message: "TIN ID is required in agent information when role is 'agent'",
      path: ["agentInfo", "tinId"],
    }
  )
  .refine(
    (data) => {
      if (data.role && data.role !== Role.AGENT && data.agentInfo) {
        return false;
      }
      return true;
    },
    {
      message: "Agent information should only be provided for agent role",
      path: ["agentInfo"],
    }
  );

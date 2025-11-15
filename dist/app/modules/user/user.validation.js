"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserZodSchema = exports.createUserZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
const agentInfoSchema = zod_1.default.object({
    tinId: zod_1.default
        .string({ message: "TIN ID must be string" })
        .regex(/^\d{10}$|^\d{13}$|^\d{17}$/, {
        message: "TIN ID must be 10, 13, or 17 digits long.",
    }),
});
exports.createUserZodSchema = zod_1.default
    .object({
    name: zod_1.default
        .string({ message: "Name must be string" })
        .min(2, { message: "Name must be at least 2 characters long." })
        .max(50, { message: "Name cannot exceed 50 characters." }),
    email: zod_1.default
        .string({ message: "Email must be string" })
        .email({ message: "Invalid email address format." })
        .min(5, { message: "Email must be at least 5 characters long." })
        .max(100, { message: "Email cannot exceed 100 characters." }),
    pin: zod_1.default
        .number({ message: "PIN must be a number" })
        .min(1000, { message: "PIN must be 4 digits." })
        .max(9999, { message: "PIN must be 4 digits." }),
    phone: zod_1.default
        .string({ message: "Phone Number must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
        message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),
    nid: zod_1.default
        .string({ message: "NID must be string" })
        .regex(/^\d{10}$|^\d{13}$|^\d{17}$/, {
        message: "NID must be 10, 13, or 17 digits long.",
    }),
    role: zod_1.default.nativeEnum(user_interface_1.Role).default(user_interface_1.Role.USER).optional(),
    picture: zod_1.default.string().url().optional(),
    address: zod_1.default.string().max(200).optional(),
    agentInfo: agentInfoSchema.optional(),
})
    .refine((data) => {
    if (data.role === user_interface_1.Role.AGENT && !data.agentInfo) {
        return false;
    }
    return true;
}, {
    message: "Agent information is required when role is 'agent'",
    path: ["agentInfo"],
})
    .refine((data) => {
    if (data.role !== user_interface_1.Role.AGENT && data.agentInfo) {
        return false;
    }
    return true;
}, {
    message: "Agent information should only be provided for agent role",
    path: ["agentInfo"],
});
exports.updateUserZodSchema = zod_1.default
    .object({
    name: zod_1.default
        .string({ message: "Name must be string" })
        .min(2, { message: "Name must be at least 2 characters long." })
        .max(50, { message: "Name cannot exceed 50 characters." })
        .optional(),
    email: zod_1.default
        .string({ message: "Email must be string" })
        .email({ message: "Invalid email address format." })
        .min(5, { message: "Email must be at least 5 characters long." })
        .max(100, { message: "Email cannot exceed 100 characters." })
        .optional(),
    pin: zod_1.default
        .number({ message: "PIN must be a number" })
        .min(1000, { message: "PIN must be 4 digits." })
        .max(9999, { message: "PIN must be 4 digits." })
        .optional(),
    phone: zod_1.default
        .string({ message: "Phone Number must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
        message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
        .optional(),
    nid: zod_1.default
        .string({ message: "NID must be string" })
        .regex(/^\d{10}$|^\d{13}$|^\d{17}$/, {
        message: "NID must be 10, 13, or 17 digits long.",
    })
        .optional(),
    role: zod_1.default.nativeEnum(user_interface_1.Role).optional(),
    picture: zod_1.default.string().optional(),
    address: zod_1.default.string().max(200).optional(),
    agentInfo: agentInfoSchema.optional(),
})
    .refine((data) => {
    if (data.role === user_interface_1.Role.AGENT && data.agentInfo && !data.agentInfo.tinId) {
        return false;
    }
    return true;
}, {
    message: "TIN ID is required in agent information when role is 'agent'",
    path: ["agentInfo", "tinId"],
})
    .refine((data) => {
    if (data.role && data.role !== user_interface_1.Role.AGENT && data.agentInfo) {
        return false;
    }
    return true;
}, {
    message: "Agent information should only be provided for agent role",
    path: ["agentInfo"],
});

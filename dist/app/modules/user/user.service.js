"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_model_1 = require("./user.model");
const user_interface_1 = require("./user.interface");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../../config/env");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, pin } = payload, rest = __rest(payload, ["email", "pin"]);
    const isUserExist = yield user_model_1.User.findOne({ email });
    if (isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User Already Exist");
    }
    if (pin === undefined || pin === null) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Pin is required");
    }
    const hashedPin = yield bcryptjs_1.default.hash(String(pin), Number(env_1.envVariables.BCRYPT_SALT_ROUND));
    const user = yield user_model_1.User.create(Object.assign({ email, pin: hashedPin }, rest));
    return user;
});
const updateUser = (userId, payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const ifUserExist = yield user_model_1.User.findById(userId);
    if (!ifUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User Not Found");
    }
    const restrictedFields = ["email", "phone", "nid", "pin"];
    if (ifUserExist.role === user_interface_1.Role.AGENT || payload.role === user_interface_1.Role.AGENT) {
        restrictedFields.push("agentInfo");
    }
    if (decodedToken.role === user_interface_1.Role.USER || decodedToken.role === user_interface_1.Role.AGENT) {
        const attemptedRestrictedUpdates = Object.keys(payload).filter((key) => restrictedFields.includes(key));
        if (attemptedRestrictedUpdates.length > 0) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, `Restriction To Update ${attemptedRestrictedUpdates.join(", ")}, Please Contact Help Line Number`);
        }
    }
    console.log(payload.role);
    if (payload.role) {
        if (decodedToken.role === user_interface_1.Role.USER || decodedToken.role === user_interface_1.Role.AGENT) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
        }
        if (payload.role === user_interface_1.Role.ADMIN && decodedToken.role === user_interface_1.Role.ADMIN) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
        }
    }
    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (decodedToken.role === user_interface_1.Role.USER || decodedToken.role === user_interface_1.Role.AGENT) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
        }
    }
    if (payload.pin) {
        payload.pin = yield bcryptjs_1.default.hash(payload.pin, env_1.envVariables.BCRYPT_SALT_ROUND);
    }
    const newUpdatedUser = yield user_model_1.User.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
    });
    return newUpdatedUser;
});
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.User.find({ role: "user" });
    const totalUsers = yield user_model_1.User.countDocuments({ role: "user" });
    return {
        data: users,
        meta: {
            total: totalUsers,
        },
    };
});
const getAllAgents = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.User.find({ role: "agent" });
    const totalUsers = yield user_model_1.User.countDocuments({ role: "agent" });
    return {
        data: users,
        meta: {
            total: totalUsers,
        },
    };
});
const getSingleUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    return {
        data: user,
    };
});
const getEmail = (phone) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ phone });
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found with this phone number");
    }
    if (!user.email) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "No email found for this user");
    }
    return {
        data: {
            email: user.email,
        },
    };
});
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select("-pin");
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    return {
        data: user,
    };
});
const approveAgent = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const ifUserExist = yield user_model_1.User.findById(userId);
    if (!ifUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User Not Found");
    }
    if (ifUserExist.role !== user_interface_1.Role.AGENT) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is not an agent");
    }
    const updateData = {
        $set: {
            "agentInfo.approvalStatus": payload.approvalStatus,
        },
    };
    const newUpdatedUser = yield user_model_1.User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
    });
    return newUpdatedUser;
});
const changeStatus = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const ifUserExist = yield user_model_1.User.findById(userId);
    if (!ifUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User Not Found");
    }
    const updateData = {
        $set: {
            isActive: payload.isActive,
        },
    };
    const newUpdatedUser = yield user_model_1.User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
    });
    return newUpdatedUser;
});
const getAllAgentRequest = () => __awaiter(void 0, void 0, void 0, function* () {
    const agents = yield user_model_1.User.find({
        role: user_interface_1.Role.AGENT,
        agentInfo: { $exists: true },
        "agentInfo.approvalStatus": user_interface_1.ApprovalStatus.PENDING,
    }).select("name email phone nid agentInfo createdAt");
    const totalPendingAgents = yield user_model_1.User.countDocuments({
        role: user_interface_1.Role.AGENT,
        agentInfo: { $exists: true },
        "agentInfo.approvalStatus": user_interface_1.ApprovalStatus.PENDING,
    });
    return {
        data: agents,
        meta: {
            total: totalPendingAgents,
        },
    };
});
exports.UserServices = {
    createUser,
    updateUser,
    getAllUsers,
    getSingleUser,
    getMe,
    getAllAgents,
    approveAgent,
    getAllAgentRequest,
    changeStatus,
    getEmail,
};

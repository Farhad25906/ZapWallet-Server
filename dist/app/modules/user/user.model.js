"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const superAdminInfoSchema = new mongoose_1.Schema({
    totalCommission: {
        type: Number,
        default: 0,
        min: 0,
    },
}, {
    versionKey: false,
    _id: false,
});
const agentInfoSchema = new mongoose_1.Schema({
    approvalStatus: {
        type: String,
        enum: Object.values(user_interface_1.ApprovalStatus),
        default: user_interface_1.ApprovalStatus.PENDING,
    },
    commissionRate: {
        type: Number,
        default: 1.5,
    },
    totalCommission: {
        type: Number,
        default: 0,
        min: 0,
    },
    approvedAt: Date,
    tinId: {
        type: String,
        required: true,
        match: [
            /^\d{10}$|^\d{13}$|^\d{17}$/,
            "Please enter a valid Tin Id number",
        ],
    },
}, {
    versionKey: false,
    _id: false,
});
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please enter a valid email",
        ],
    },
    pin: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        unique: true,
        required: true,
        match: [
            /^(?:\+88|88)?(01[3-9]\d{8})$/,
            "Please enter a valid Bangladeshi phone number",
        ],
    },
    nid: {
        type: String,
        unique: true,
        required: true,
        match: [/^\d{10}$|^\d{13}$|^\d{17}$/, "Please enter a valid NID number"],
    },
    role: {
        type: String,
        enum: Object.values(user_interface_1.Role),
        default: user_interface_1.Role.USER,
    },
    picture: { type: String },
    address: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: {
        type: String,
        enum: Object.values(user_interface_1.IsActive),
        default: user_interface_1.IsActive.ACTIVE,
    },
    isVerified: { type: Boolean, default: false },
    agentInfo: agentInfoSchema,
    superAdminInfo: superAdminInfoSchema,
    wallet: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Wallet",
    },
}, {
    timestamps: true,
    versionKey: false,
});
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // Remove agent info if role is not agent
        if (this.role !== user_interface_1.Role.AGENT && this.agentInfo) {
            this.agentInfo = undefined;
        }
        // Remove super admin info if role is not super admin
        if (this.role !== user_interface_1.Role.SUPER_ADMIN && this.superAdminInfo) {
            this.superAdminInfo = undefined;
        }
        // Validate agent info for agent role
        if (this.role === user_interface_1.Role.AGENT && !this.agentInfo) {
            return next(new Error("Agent information is required for agent role"));
        }
        // Initialize super admin info for super admin role
        if (this.role === user_interface_1.Role.SUPER_ADMIN && !this.superAdminInfo) {
            this.superAdminInfo = { totalCommission: 0 };
        }
        if (this.isNew && !this.wallet) {
            try {
                const { Wallet } = yield Promise.resolve().then(() => __importStar(require("../wallet/wallet.model")));
                let initialBalance = 50;
                if (this.role === user_interface_1.Role.SUPER_ADMIN) {
                    initialBalance = 100000000;
                }
                const wallet = new Wallet({
                    user: this._id,
                    balance: initialBalance,
                });
                yield wallet.save();
                this.wallet = wallet._id;
            }
            catch (error) {
                return next(error);
            }
        }
        next();
    });
});
exports.User = (0, mongoose_1.model)("User", userSchema);

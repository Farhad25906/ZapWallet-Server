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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const mongoose_1 = require("mongoose");
const wallet_interface_1 = require("./wallet.interface");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = require("http-status-codes");
const walletSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    balance: { type: Number, required: true, default: 50 },
    currency: { type: String, default: "BDT" },
    walletStatus: {
        type: String,
        enum: Object.values(wallet_interface_1.WALLET_STATUS),
        default: wallet_interface_1.WALLET_STATUS.ACTIVE,
    },
    transactions: {
        type: [
            {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "transaction",
            },
        ],
        default: [],
    },
}, {
    timestamps: true,
    versionKey: false,
});
// Checking Insufficient balance
walletSchema.pre("save", function (next) {
    if (this.isModified("balance") || this.isNew) {
        if (typeof this.balance === "number" && this.balance < 0) {
            return next(new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Insufficient balance"));
        }
    }
    next();
});
//checking balance availability
walletSchema.static("balanceAvailability", function (requestedBalance, senderWallet, session) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingWallet = yield this.findOne({ _id: senderWallet }).session(session);
        if (!existingWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Wallet not found");
        }
        const wallet = yield this.findOneAndUpdate({
            _id: senderWallet,
            balance: { $gte: requestedBalance }
        }, { $inc: { balance: -requestedBalance } }, { runValidators: true, new: true, session });
        if (!wallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Insufficient balance or wallet not found");
        }
        return wallet;
    });
});
exports.Wallet = (0, mongoose_1.model)("Wallet", walletSchema);

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
exports.WalletController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const wallet_service_1 = require("./wallet.service");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const getMyWallet = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user;
    const data = yield wallet_service_1.WalletService.getMyWallet(decodedToken.userId);
    if (!decodedToken.userId) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "User ID not found in token");
    }
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Wallet retrieved successfully",
        data,
    });
}));
// Admin: Get all wallets
const getAllWallets = (0, catchAsync_1.catchAsync)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield wallet_service_1.WalletService.getAllWallets();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "All Wallet retrieved successfully",
        data: result,
    });
}));
// Admin: Get wallet by ID
const getWalletById = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield wallet_service_1.WalletService.getWalletById(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Wallet fetched successfully",
        data: result,
    });
}));
// Admin: Block/unblock wallet
const updateWalletStatus = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    if (!["blocked", "active"].includes(status)) {
        res.status(http_status_codes_1.default.BAD_REQUEST).json({
            success: false,
            message: "Invalid wallet status. Must be 'blocked' or 'active'.",
        });
        return;
    }
    const result = yield wallet_service_1.WalletService.updateWalletStatus(id, status);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: `Wallet status updated to ${status}`,
        data: result,
    });
}));
// 1. Add Money → Admin → Agent
const addMoneyToAgent = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { agentWalletNumber, amount } = req.body;
    const verifiedToken = req.user;
    const adminId = verifiedToken.userId;
    if (!agentWalletNumber || !amount || amount <= 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Valid agentWalletNumber and positive amount are required");
    }
    const result = yield wallet_service_1.WalletService.addMoneyAdminToAgent(agentWalletNumber, amount, adminId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Money added to agent successfully",
        data: result,
    });
}));
// 2. Withdraw → Agent → Admin
const withdrawToAdmin = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, adminWalletNumber } = req.body;
    const verifiedToken = req.user;
    const agentId = verifiedToken.userId;
    if (!amount || amount <= 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Valid positive amount is required");
    }
    const result = yield wallet_service_1.WalletService.withdrawAgentToAdmin(amount, agentId, adminWalletNumber);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Withdrawal to admin successful",
        data: result,
    });
}));
// 3. Send Money → User → User
const sendMoney = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, toWalletNumber } = req.body;
    const decodedToken = req.user;
    if (!amount || !toWalletNumber || amount <= 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Valid amount and toWalletNumber are required");
    }
    const result = yield wallet_service_1.WalletService.sendMoneyUserToUser({ amount, toWalletNumber }, decodedToken);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Money sent successfully",
        data: result,
    });
}));
// 4. Cash In → Agent → User
const cashIn = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, toWalletNumber } = req.body;
    const decodedToken = req.user;
    // console.log(amount,toWalletNumber);
    if (!amount || !toWalletNumber || amount <= 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Valid amount and toWalletNumber are required");
    }
    const result = yield wallet_service_1.WalletService.cashInAgentToUser({ amount, toWalletNumber }, decodedToken);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Cash in successful",
        data: result,
    });
}));
// 5. Cash Out → User → Agent
const cashOut = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, agentWalletNumber } = req.body;
    const decodedToken = req.user;
    if (!amount || !agentWalletNumber || amount <= 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Valid amount and agentWalletNumber are required");
    }
    const result = yield wallet_service_1.WalletService.cashOutUserToAgent({ amount, agentWalletNumber }, decodedToken);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Cash out successful",
        data: result,
    });
}));
exports.WalletController = {
    getMyWallet,
    getAllWallets,
    getWalletById,
    updateWalletStatus,
    addMoneyToAgent,
    withdrawToAdmin,
    sendMoney,
    cashIn,
    cashOut,
};

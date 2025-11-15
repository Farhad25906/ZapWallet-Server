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
exports.TransactionController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const transaction_service_1 = require("./transaction.service");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
// MY TRANSACTIONS 
const getMyTransactions = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = req.user.userId;
    const page = Number((_a = req.query.page) !== null && _a !== void 0 ? _a : 1);
    const limit = Number((_b = req.query.limit) !== null && _b !== void 0 ? _b : 10);
    const type = req.query.type;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const filters = { type, startDate, endDate };
    const result = yield transaction_service_1.TransactionService.getMyTransactions(userId, filters, page, limit);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Your transaction history retrieved",
        data: result,
    });
}));
const getAllTransactions = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const page = Number((_a = req.query.page) !== null && _a !== void 0 ? _a : 1);
    const limit = Number((_b = req.query.limit) !== null && _b !== void 0 ? _b : 10);
    const type = req.query.type;
    const status = req.query.status;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const minAmount = req.query.minAmount ? Number(req.query.minAmount) : undefined;
    const maxAmount = req.query.maxAmount ? Number(req.query.maxAmount) : undefined;
    const filters = { type, status, startDate, endDate, minAmount, maxAmount };
    const result = yield transaction_service_1.TransactionService.getAllTransactions(filters, page, limit);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "All transactions retrieved successfully",
        data: result,
    });
}));
exports.TransactionController = {
    getMyTransactions,
    getAllTransactions,
};

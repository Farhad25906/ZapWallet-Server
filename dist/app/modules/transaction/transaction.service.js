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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
// transaction.service.ts
const transaction_model_1 = require("./transaction.model");
const getMyTransactions = (userId_1, filters_1, ...args_1) => __awaiter(void 0, [userId_1, filters_1, ...args_1], void 0, function* (userId, filters, page = 1, limit = 10) {
    const query = {
        $or: [{ from: userId }, { to: userId }],
    };
    if (filters.type)
        query.type = filters.type;
    if (filters.startDate && filters.endDate) {
        query.createdAt = {
            $gte: new Date(filters.startDate),
            $lte: new Date(filters.endDate),
        };
    }
    const transactions = yield transaction_model_1.Transaction.find(query)
        .populate("from to", "name email phone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const total = yield transaction_model_1.Transaction.countDocuments(query);
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
    // Ensure page doesn't exceed total pages
    const currentPage = Math.min(page, totalPages || 1);
    return {
        transactions,
        total,
        page: currentPage,
        limit,
        totalPages,
    };
});
const getAllTransactions = (filters_1, ...args_1) => __awaiter(void 0, [filters_1, ...args_1], void 0, function* (filters, page = 1, limit = 10) {
    const query = {};
    if (filters.type)
        query.type = filters.type;
    if (filters.status)
        query.status = filters.status;
    if (filters.startDate && filters.endDate) {
        query.createdAt = {
            $gte: new Date(filters.startDate),
            $lte: new Date(filters.endDate),
        };
    }
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
        query.amount = {};
        if (filters.minAmount !== undefined)
            query.amount.$gte = filters.minAmount;
        if (filters.maxAmount !== undefined)
            query.amount.$lte = filters.maxAmount;
    }
    // Get transactions with pagination
    const transactions = yield transaction_model_1.Transaction.find(query)
        .populate("from", "name email phone")
        .populate("to", "name email phone")
        .sort({ createdAt: -1 }) // Latest first
        .skip((page - 1) * limit)
        .limit(limit);
    // Get total count for pagination
    const total = yield transaction_model_1.Transaction.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    return {
        transactions,
        total,
        page,
        limit,
        totalPages
    };
});
exports.TransactionService = {
    getMyTransactions,
    getAllTransactions,
};

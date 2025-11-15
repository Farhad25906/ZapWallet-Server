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
exports.CommissionService = void 0;
// commission.service.ts
const mongoose_1 = require("mongoose");
const transaction_model_1 = require("../transaction/transaction.model");
const getAgentTotalCommission = (agentId) => __awaiter(void 0, void 0, void 0, function* () {
    const transactions = yield transaction_model_1.Transaction.aggregate([
        {
            $match: {
                $or: [{ "commission.agentCommission": { $gt: 0 } }],
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "from",
                foreignField: "_id",
                as: "fromUser",
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "to",
                foreignField: "_id",
                as: "toUser",
            },
        },
        {
            $unwind: "$fromUser",
        },
        {
            $unwind: "$toUser",
        },
        {
            $match: {
                $or: [
                    { "fromUser._id": new mongoose_1.Types.ObjectId(agentId) },
                    { "toUser._id": new mongoose_1.Types.ObjectId(agentId) },
                ],
            },
        },
    ]);
    const summary = transactions.reduce((acc, transaction) => {
        var _a;
        const agentCommission = ((_a = transaction.commission) === null || _a === void 0 ? void 0 : _a.agentCommission) || 0;
        return {
            agentCommission: acc.agentCommission + agentCommission,
        };
    }, {
        agentCommission: 0,
    });
    return Object.assign(Object.assign({}, summary), { transactionCount: transactions.length });
});
const getAdminTotalCommission = () => __awaiter(void 0, void 0, void 0, function* () {
    const transactions = yield transaction_model_1.Transaction.aggregate([
        {
            $match: {
                $or: [
                    { "commission.superAdminCommission": { $gt: 0 } },
                    { "commission.systemFee": { $gt: 0 } },
                ],
            },
        },
    ]);
    const summary = transactions.reduce((acc, transaction) => {
        var _a, _b;
        const cashOutFee = ((_a = transaction.commission) === null || _a === void 0 ? void 0 : _a.superAdminCommission) || 0;
        const sendMoney = ((_b = transaction.commission) === null || _b === void 0 ? void 0 : _b.systemFee) || 0;
        return {
            totalCommission: acc.totalCommission + cashOutFee + sendMoney,
            cashOutFee: acc.cashOutFee + cashOutFee,
            sendMoney: acc.sendMoney + sendMoney,
        };
    }, {
        totalCommission: 0,
        cashOutFee: 0,
        sendMoney: 0,
    });
    return Object.assign(Object.assign({}, summary), { transactionCount: transactions.length });
});
const getAgentCommissionTransactions = (agentId_1, ...args_1) => __awaiter(void 0, [agentId_1, ...args_1], void 0, function* (agentId, page = 1, limit = 10, filters) {
    var _a;
    const skip = (page - 1) * limit;
    const matchStage = {
        $or: [
            { "commission.agentCommission": { $gt: 0 } },
            { "commission.superAdminCommission": { $gt: 0 } },
            { "commission.systemFee": { $gt: 0 } },
        ],
    };
    // Add date filters if provided
    if ((filters === null || filters === void 0 ? void 0 : filters.startDate) || (filters === null || filters === void 0 ? void 0 : filters.endDate)) {
        matchStage.createdAt = {};
        if (filters.startDate)
            matchStage.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate)
            matchStage.createdAt.$lte = new Date(filters.endDate);
    }
    const [transactions, total] = yield Promise.all([
        transaction_model_1.Transaction.aggregate([
            {
                $match: matchStage,
            },
            {
                $lookup: {
                    from: "users",
                    localField: "from",
                    foreignField: "_id",
                    as: "fromUser",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "to",
                    foreignField: "_id",
                    as: "toUser",
                },
            },
            {
                $unwind: "$fromUser",
            },
            {
                $unwind: "$toUser",
            },
            {
                $match: {
                    $or: [
                        { "fromUser._id": new mongoose_1.Types.ObjectId(agentId) },
                        { "toUser._id": new mongoose_1.Types.ObjectId(agentId) },
                    ],
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
            {
                $project: {
                    amount: 1,
                    type: 1,
                    createdAt: 1,
                    commission: 1,
                    from: {
                        _id: "$fromUser._id",
                        name: "$fromUser.name",
                        phone: "$fromUser.phone",
                        role: "$fromUser.role",
                    },
                    to: {
                        _id: "$toUser._id",
                        name: "$toUser.name",
                        phone: "$toUser.phone",
                        role: "$toUser.role",
                    },
                },
            },
        ]),
        transaction_model_1.Transaction.aggregate([
            {
                $match: matchStage,
            },
            {
                $lookup: {
                    from: "users",
                    localField: "from",
                    foreignField: "_id",
                    as: "fromUser",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "to",
                    foreignField: "_id",
                    as: "toUser",
                },
            },
            {
                $unwind: "$fromUser",
            },
            {
                $unwind: "$toUser",
            },
            {
                $match: {
                    $or: [
                        { "fromUser._id": new mongoose_1.Types.ObjectId(agentId) },
                        { "toUser._id": new mongoose_1.Types.ObjectId(agentId) },
                    ],
                },
            },
            {
                $count: "total",
            },
        ]),
    ]);
    const totalCount = ((_a = total[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
    const totalPages = Math.ceil(totalCount / limit);
    return {
        transactions: transactions,
        total: totalCount,
        page,
        totalPages,
    };
});
const getAdminCommissionTransactions = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10, filters) {
    const skip = (page - 1) * limit;
    const matchStage = {
        $or: [
            { "commission.agentCommission": { $gt: 0 } },
            { "commission.superAdminCommission": { $gt: 0 } },
            { "commission.systemFee": { $gt: 0 } },
        ],
    };
    // Add date filters if provided
    if ((filters === null || filters === void 0 ? void 0 : filters.startDate) || (filters === null || filters === void 0 ? void 0 : filters.endDate)) {
        matchStage.createdAt = {};
        if (filters.startDate)
            matchStage.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate)
            matchStage.createdAt.$lte = new Date(filters.endDate);
    }
    const [transactions, total] = yield Promise.all([
        transaction_model_1.Transaction.aggregate([
            {
                $match: matchStage,
            },
            {
                $lookup: {
                    from: "users",
                    localField: "from",
                    foreignField: "_id",
                    as: "fromUser",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "to",
                    foreignField: "_id",
                    as: "toUser",
                },
            },
            {
                $unwind: "$fromUser",
            },
            {
                $unwind: "$toUser",
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
            {
                $project: {
                    amount: 1,
                    type: 1,
                    createdAt: 1,
                    commission: 1,
                    from: {
                        _id: "$fromUser._id",
                        name: "$fromUser.name",
                        phone: "$fromUser.phone",
                        role: "$fromUser.role",
                    },
                    to: {
                        _id: "$toUser._id",
                        name: "$toUser.name",
                        phone: "$toUser.phone",
                        role: "$toUser.role",
                    },
                },
            },
        ]),
        transaction_model_1.Transaction.countDocuments(matchStage),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        transactions: transactions,
        total,
        page,
        totalPages,
    };
});
exports.CommissionService = {
    getAgentTotalCommission,
    getAgentCommissionTransactions,
    getAdminTotalCommission,
    getAdminCommissionTransactions,
};

// commission.service.ts
import { Types } from "mongoose";
import { Transaction } from "../transaction/transaction.model";
import {
  ICommissionSummary,
  ICommissionTransaction,
  ICommissionFilters,
} from "./commission.interface";

const getAgentTotalCommission = async (
  agentId: string | Types.ObjectId
): Promise<ICommissionSummary> => {
  const transactions = await Transaction.aggregate([
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
          { "fromUser._id": new Types.ObjectId(agentId) },
          { "toUser._id": new Types.ObjectId(agentId) },
        ],
      },
    },
  ]);

  const summary = transactions.reduce(
    (acc: Omit<ICommissionSummary, "transactionCount">, transaction) => {
      const agentCommission = transaction.commission?.agentCommission || 0;

      return {
        agentCommission: acc.agentCommission + agentCommission,
      };
    },
    {
      agentCommission: 0,
    }
  );

  return {
    ...summary,
    transactionCount: transactions.length,
  };
};

const getAdminTotalCommission = async (): Promise<ICommissionSummary> => {
  const transactions = await Transaction.aggregate([
    {
      $match: {
        $or: [
          { "commission.superAdminCommission": { $gt: 0 } },
          { "commission.systemFee": { $gt: 0 } },
        ],
      },
    },
  ]);

  const summary = transactions.reduce(
    (acc: Omit<ICommissionSummary, "transactionCount">, transaction) => {
      const cashOutFee = transaction.commission?.superAdminCommission || 0; 
      const sendMoney = transaction.commission?.systemFee || 0; 

      return {
        totalCommission: acc.totalCommission + cashOutFee + sendMoney,
        cashOutFee: acc.cashOutFee + cashOutFee,
        sendMoney: acc.sendMoney + sendMoney,
      };
    },
    {
      totalCommission: 0,
      cashOutFee: 0,
      sendMoney: 0,
    }
  );

  return {
    ...summary,
    transactionCount: transactions.length,
  };
};

const getAgentCommissionTransactions = async (
  agentId: string | Types.ObjectId,
  page = 1,
  limit = 10,
  filters?: ICommissionFilters
): Promise<{
  transactions: ICommissionTransaction[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const skip = (page - 1) * limit;

  const matchStage: Record<string, unknown> = {
    $or: [
      { "commission.agentCommission": { $gt: 0 } },
      { "commission.superAdminCommission": { $gt: 0 } },
      { "commission.systemFee": { $gt: 0 } },
    ],
  };

  // Add date filters if provided
  if (filters?.startDate || filters?.endDate) {
    matchStage.createdAt = {};
    if (filters.startDate)
      (matchStage.createdAt as Record<string, Date>).$gte = new Date(
        filters.startDate
      );
    if (filters.endDate)
      (matchStage.createdAt as Record<string, Date>).$lte = new Date(
        filters.endDate
      );
  }

  const [transactions, total] = await Promise.all([
    Transaction.aggregate([
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
            { "fromUser._id": new Types.ObjectId(agentId) },
            { "toUser._id": new Types.ObjectId(agentId) },
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
    Transaction.aggregate([
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
            { "fromUser._id": new Types.ObjectId(agentId) },
            { "toUser._id": new Types.ObjectId(agentId) },
          ],
        },
      },
      {
        $count: "total",
      },
    ]),
  ]);

  const totalCount = total[0]?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    transactions: transactions as ICommissionTransaction[],
    total: totalCount,
    page,
    totalPages,
  };
};

const getAdminCommissionTransactions = async (
  page = 1,
  limit = 10,
  filters?: ICommissionFilters
): Promise<{
  transactions: ICommissionTransaction[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const skip = (page - 1) * limit;

  const matchStage: Record<string, unknown> = {
    $or: [
      { "commission.agentCommission": { $gt: 0 } },
      { "commission.superAdminCommission": { $gt: 0 } },
      { "commission.systemFee": { $gt: 0 } },
    ],
  };

  // Add date filters if provided
  if (filters?.startDate || filters?.endDate) {
    matchStage.createdAt = {};
    if (filters.startDate)
      (matchStage.createdAt as Record<string, Date>).$gte = new Date(
        filters.startDate
      );
    if (filters.endDate)
      (matchStage.createdAt as Record<string, Date>).$lte = new Date(
        filters.endDate
      );
  }

  const [transactions, total] = await Promise.all([
    Transaction.aggregate([
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
    Transaction.countDocuments(matchStage),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    transactions: transactions as ICommissionTransaction[],
    total,
    page,
    totalPages,
  };
};

export const CommissionService = {
  getAgentTotalCommission,
  getAgentCommissionTransactions,
  getAdminTotalCommission,
  getAdminCommissionTransactions,
};

// transaction.service.ts
import { Transaction } from "./transaction.model";

const getMyTransactions = async (
  userId: string,
  filters: { type?: string; startDate?: string; endDate?: string },
  page = 1,
  limit = 10
) => {
  const query: any = {
    $or: [{ from: userId }, { to: userId }],
  };

  if (filters.type) query.type = filters.type;
  if (filters.startDate && filters.endDate) {
    query.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  }

  const transactions = await Transaction.find(query)
    .populate("from to", "name email phone")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Transaction.countDocuments(query);

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
};

const getAllTransactions = async (
  filters: {
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
  },
  page = 1,
  limit = 10
) => {
  const query: any = {};

  if (filters.type) query.type = filters.type;
  if (filters.status) query.status = filters.status;
  
  if (filters.startDate && filters.endDate) {
    query.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  }
  
  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    query.amount = {};
    if (filters.minAmount !== undefined) query.amount.$gte = filters.minAmount;
    if (filters.maxAmount !== undefined) query.amount.$lte = filters.maxAmount;
  }


  // Get transactions with pagination
  const transactions = await Transaction.find(query)
    .populate("from", "name email phone")
    .populate("to", "name email phone")
    .sort({ createdAt: -1 }) // Latest first
    .skip((page - 1) * limit)
    .limit(limit);

  // Get total count for pagination
  const total = await Transaction.countDocuments(query);
  
  const totalPages = Math.ceil(total / limit);

  return { 
    transactions, 
    total, 
    page, 
    limit, 
    totalPages 
  };
};
export const TransactionService = {
  getMyTransactions,
  getAllTransactions,
};

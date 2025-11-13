import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { TransactionService } from "./transaction.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

// MY TRANSACTIONS 
const getMyTransactions = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as { userId: string }).userId;

  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const type = req.query.type as string | undefined;
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;

  const filters = { type, startDate, endDate };

  const result = await TransactionService.getMyTransactions(userId, filters, page, limit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your transaction history retrieved",
    data: result,
  });
});


const getAllTransactions = catchAsync(async (req: Request, res: Response) => {

  
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const type = req.query.type as string | undefined;
  const status = req.query.status as string | undefined;
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;
  const minAmount = req.query.minAmount ? Number(req.query.minAmount) : undefined;
  const maxAmount = req.query.maxAmount ? Number(req.query.maxAmount) : undefined;

  const filters = { type, status, startDate, endDate, minAmount, maxAmount };

  const result = await TransactionService.getAllTransactions(filters, page, limit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All transactions retrieved successfully",
    data: result,
  });
});


export const TransactionController = {
  getMyTransactions,
  getAllTransactions,
};
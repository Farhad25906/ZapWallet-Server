// commission.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CommissionService } from "./commission.service";
import AppError from "../../errorHelpers/AppError";
import { Role } from "../user/user.interface";

const getAgentTotalCommission = catchAsync(async (req: Request, res: Response) => {
  const agentId = req.user?.userId;
  
  if (!agentId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const commissionSummary = await CommissionService.getAgentTotalCommission(agentId);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Agent commission summary retrieved successfully",
    data: commissionSummary
  });
});

const getAgentCommissionTransactions = catchAsync(async (req: Request, res: Response) => {
  const agentId = req.user?.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  if (!agentId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  // Extract query parameters for filters
  const { startDate, endDate } = req.query;
  const filters: any = {};
  
  if (startDate) filters.startDate = new Date(startDate as string);
  if (endDate) filters.endDate = new Date(endDate as string);

  const result = await CommissionService.getAgentCommissionTransactions(agentId, page, limit, filters);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Agent commission transactions retrieved successfully",
    data: result
  });
});

const getAdminTotalCommission = catchAsync(async (req: Request, res: Response) => {
  const userRole = req.user?.role;
  
  if (userRole !== Role.ADMIN && userRole !== Role.SUPER_ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Access denied. Admin role required.");
  }

  const commissionSummary = await CommissionService.getAdminTotalCommission();
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin commission summary retrieved successfully",
    data: commissionSummary
  });
});

const getAdminCommissionTransactions = catchAsync(async (req: Request, res: Response) => {
  const userRole = req.user?.role;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  if (userRole !== Role.ADMIN && userRole !== Role.SUPER_ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Access denied. Admin role required.");
  }

  // Extract query parameters for filters
  const { startDate, endDate } = req.query;
  const filters: any = {};
  
  if (startDate) filters.startDate = new Date(startDate as string);
  if (endDate) filters.endDate = new Date(endDate as string);

  const result = await CommissionService.getAdminCommissionTransactions(page, limit, filters);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin commission transactions retrieved successfully",
    data: result
  });
});

export const CommissionController = {
  getAgentTotalCommission,
  getAgentCommissionTransactions,
  getAdminTotalCommission,
  getAdminCommissionTransactions,
};
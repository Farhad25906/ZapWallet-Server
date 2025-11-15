import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { WalletService } from "./wallet.service";
import AppError from "../../errorHelpers/AppError";
import { JwtPayload } from "jsonwebtoken";

const getMyWallet = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;

  const data = await WalletService.getMyWallet(decodedToken.userId);

  if (!decodedToken.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User ID not found in token");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Wallet retrieved successfully",
    data,
  });
});

// Admin: Get all wallets
const getAllWallets = catchAsync(async (_req: Request, res: Response) => {
  const result = await WalletService.getAllWallets();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Wallet retrieved successfully",
    data: result,
  });
});

// Admin: Get wallet by ID
const getWalletById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await WalletService.getWalletById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Wallet fetched successfully",
    data: result,
  });
});

// Admin: Block/unblock wallet
const updateWalletStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["blocked", "active"].includes(status)) {
    res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Invalid wallet status. Must be 'blocked' or 'active'.",
    });
    return;
  }

  const result = await WalletService.updateWalletStatus(id, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Wallet status updated to ${status}`,
    data: result,
  });
});

// 1. Add Money → Admin → Agent
const addMoneyToAgent = catchAsync(async (req: Request, res: Response) => {
  const { agentWalletNumber, amount } = req.body;
  const verifiedToken = req.user as JwtPayload;
  const adminId = verifiedToken.userId;

  if (!agentWalletNumber || !amount || amount <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Valid agentWalletNumber and positive amount are required"
    );
  }

  const result = await WalletService.addMoneyAdminToAgent(
    agentWalletNumber,
    amount,
    adminId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Money added to agent successfully",
    data: result,
  });
});

// 2. Withdraw → Agent → Admin
const withdrawToAdmin = catchAsync(async (req: Request, res: Response) => {
  const { amount, adminWalletNumber } = req.body;
  const verifiedToken = req.user as JwtPayload;
  const agentId = verifiedToken.userId;

  if (!amount || amount <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Valid positive amount is required"
    );
  }

  const result = await WalletService.withdrawAgentToAdmin(
    amount,
    agentId,
    adminWalletNumber
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Withdrawal to admin successful",
    data: result,
  });
});

// 3. Send Money → User → User
const sendMoney = catchAsync(async (req: Request, res: Response) => {
  const { amount, toWalletNumber } = req.body;
  const decodedToken = req.user as JwtPayload;

  if (!amount || !toWalletNumber || amount <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Valid amount and toWalletNumber are required"
    );
  }

  const result = await WalletService.sendMoneyUserToUser(
    { amount, toWalletNumber },
    decodedToken
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Money sent successfully",
    data: result,
  });
});

// 4. Cash In → Agent → User
const cashIn = catchAsync(async (req: Request, res: Response) => {
  const { amount, toWalletNumber } = req.body;
  const decodedToken = req.user as JwtPayload;
  // console.log(amount,toWalletNumber);

  if (!amount || !toWalletNumber || amount <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Valid amount and toWalletNumber are required"
    );
  }

  const result = await WalletService.cashInAgentToUser(
    { amount, toWalletNumber },
    decodedToken
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cash in successful",
    data: result,
  });
});

// 5. Cash Out → User → Agent
const cashOut = catchAsync(async (req: Request, res: Response) => {
  const { amount, agentWalletNumber } = req.body;
  const decodedToken = req.user as JwtPayload;

  if (!amount || !agentWalletNumber || amount <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Valid amount and agentWalletNumber are required"
    );
  }

  const result = await WalletService.cashOutUserToAgent(
    { amount, agentWalletNumber },
    decodedToken
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cash out successful",
    data: result,
  });
});

export const WalletController = {
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

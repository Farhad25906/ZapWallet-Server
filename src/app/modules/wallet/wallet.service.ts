import { Types } from "mongoose";
import { Wallet } from "./wallet.model";
import { Transaction } from "../transaction/transaction.model";

import {
  TransactionType,
  TransactionInitiatedBy,
} from "../transaction/transaction.interface";
import { WALLET_STATUS } from "./wallet.interface";

import AppError from "../../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";
import { User } from "../user/user.model";
import { ApprovalStatus, IsActive, Role } from "../user/user.interface";
import { envVariables } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

// Existing wallet services
const getMyWallet = async (userId: Types.ObjectId | string) => {
  const wallet = await Wallet.findOne({
    user: new Types.ObjectId(userId),
  }).populate("user", "name email phone role nid agentInfo");

  if (!wallet) return null;

  return {
    data: wallet,
  };
};

const getAllWallets = async () => {
  const wallets = await Wallet.find({}).populate("user");
  return {
    data: wallets,
  };
};

const getWalletById = async (walletId: string) => {
  return await Wallet.findById(walletId).populate("user");
};

const updateWalletStatus = async (
  walletId: string,
  walletStatus: "active" | "blocked"
) => {
  return await Wallet.findByIdAndUpdate(
    walletId,
    { walletStatus },
    { new: true }
  );
};

// 1. Add Money → Admin → Agent
const addMoneyAdminToAgent = async (
  agentWalletNumber: string,
  amount: number,
  adminId: string
) => {
  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const agentUser = await User.findOne({
      phone: agentWalletNumber,
      role: Role.AGENT,
      "agentInfo.approvalStatus": ApprovalStatus.APPROVED,
    });

    if (!agentUser) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Agent not found or not approved"
      );
    }
    // Verify agent wallet exists and is active
    const agentWallet = await Wallet.findOne({
      _id: agentUser.wallet,
      walletStatus: WALLET_STATUS.ACTIVE,
    }).populate("user");

    if (!agentWallet) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Agent wallet not found or blocked"
      );
    }

    // Find admin wallet
    const adminWallet = await Wallet.findOne({
      user: new Types.ObjectId(adminId),
      // walletStatus: WALLET_STATUS.ACTIVE,
    });

    if (!adminWallet) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Admin wallet not found or blocked"
      );
    }

    // Check if admin has sufficient balance
    if (adminWallet.balance < amount) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Insufficient balance in admin wallet"
      );
    }

    // Update admin balance (deduct amount)
    const updatedAdminWallet = await Wallet.findOneAndUpdate(
      { _id: adminWallet._id },
      { $inc: { balance: -amount } },
      { new: true, session, runValidators: true }
    );

    if (!updatedAdminWallet) {
      throw new AppError(
        StatusCodes.BAD_GATEWAY,
        "Failed to update admin wallet balance"
      );
    }

    // Update agent balance (add amount)
    const updatedAgentWallet = await Wallet.findOneAndUpdate(
      { _id: agentUser.wallet },
      { $inc: { balance: +amount } },
      { new: true, session, runValidators: true }
    );

    if (!updatedAgentWallet) {
      throw new AppError(
        StatusCodes.BAD_GATEWAY,
        "Failed to add money to agent wallet"
      );
    }

    const transactionPayload = {
      from: new Types.ObjectId(adminId),
      to: new Types.ObjectId(agentUser._id),
      amount,
      type: TransactionType.ADD_MONEY,
      initiatedBy: TransactionInitiatedBy.ADMIN,
      fromWallet: updatedAdminWallet._id,
      toWallet: updatedAgentWallet._id,
    };

    const transactionHistory = await Transaction.create([transactionPayload], {
      session,
    });

    await session.commitTransaction();

    return {
      transaction: transactionHistory[0],
      adminWallet: updatedAdminWallet,
      agentWallet: updatedAgentWallet,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// 2. Withdraw → Agent → Admin
const withdrawAgentToAdmin = async (
  amount: number,
  agentId: string,
  adminWalletNumber: string
) => {
  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    // Get agent wallet
    const agentWallet = await Wallet.findOne({
      user: new Types.ObjectId(agentId),
      // walletStatus: WALLET_STATUS.ACTIVE,
    });

    if (!agentWallet) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Agent wallet not found or blocked"
      );
    }

    // Verify agent is approved
    const agentUser = await User.findOne({
      _id: agentId,
      role: Role.AGENT,
      "agentInfo.approvalStatus": ApprovalStatus.APPROVED,
    });

    if (!agentUser) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Agent not found or not approved"
      );
    }

    //Find Admin
    const admin = await User.findOne({
      phone: adminWalletNumber,
    });

    if (!admin) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Admin not found ");
    }

    // Find admin wallet
    const adminWallet = await Wallet.findOne({
      _id: new Types.ObjectId(admin.wallet),
    });

    if (!adminWallet) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Admin wallet not found or blocked"
      );
    }

    const updatedAgentWallet = await Wallet.balanceAvailablity(
      amount,
      agentWallet._id.toString(),
      session
    );

    if (!updatedAgentWallet) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Insufficient balance or wallet not found"
      );
    }

    // Update admin balance (add amount)
    const updatedAdminWallet = await Wallet.findOneAndUpdate(
      { _id: adminWallet._id },
      { $inc: { balance: +amount } },
      { new: true, session, runValidators: true }
    );

    if (!updatedAdminWallet) {
      throw new AppError(
        StatusCodes.BAD_GATEWAY,
        "Failed to update admin wallet balance"
      );
    }

    // Create transaction history
    const transactionPayload = {
      from: new Types.ObjectId(agentId),
      to: new Types.ObjectId(adminWallet._id),
      amount,
      type: TransactionType.WITHDRAW,
      initiatedBy: TransactionInitiatedBy.AGENT,
      fromWallet: updatedAgentWallet._id,
      toWallet: updatedAdminWallet._id,
    };

    const transactionHistory = await Transaction.create([transactionPayload], {
      session,
    });

    await session.commitTransaction();

    return {
      transaction: transactionHistory[0],
      agentWallet: updatedAgentWallet,
      adminWallet: updatedAdminWallet,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// 3. Send Money → User → User
const sendMoneyUserToUser = async (
  payload: { amount: number; toWalletNumber: string },
  decodedToken: JwtPayload
) => {
  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const { amount, toWalletNumber } = payload;

    // Fixed fee for send money
    const systemFee = 5;
    const netAmount = amount - systemFee;

    if (netAmount <= 0) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Amount must be greater than system fee (5 taka)"
      );
    }

    // Get sender wallet
    const senderWallet = await Wallet.findOne({
      user: new Types.ObjectId(decodedToken.userId),
      walletStatus: WALLET_STATUS.ACTIVE,
    });

    if (!senderWallet) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Sender wallet not found or blocked"
      );
    }

    // Verify sender is a user
    const senderUser = await User.findOne({
      _id: decodedToken.userId,
      role: Role.USER,
    });

    if (!senderUser) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Only users can send money to other users"
      );
    }

    const receiverUser = await User.findOne({
      phone: toWalletNumber,
      role: Role.USER,
    });

    if (!receiverUser) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Can only send money to users"
      );
    }

    // Get receiver wallet
    const receiverWallet = await Wallet.findOne({
      _id: receiverUser.wallet,
      walletStatus: WALLET_STATUS.ACTIVE,
    }).populate("user");

    if (!receiverWallet) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Receiver wallet not found or blocked"
      );
    }

    // Verify receiver is a user

    // Check and update sender balance (deduct amount + fee)
    const totalDeduction = amount; // Full amount including fee
    const updatedSenderWallet = await Wallet.balanceAvailablity(
      totalDeduction,
      senderWallet._id.toString(),
      session
    );

    if (!updatedSenderWallet) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Insufficient balance (including system fee)"
      );
    }

    // Update receiver balance (add net amount)
    const updatedReceiverWallet = await Wallet.findOneAndUpdate(
      { _id: receiverUser.wallet },
      { $inc: { balance: +netAmount } },
      { new: true, session, runValidators: true }
    );

    if (!updatedReceiverWallet) {
      throw new AppError(
        StatusCodes.BAD_GATEWAY,
        "Failed to update receiver balance"
      );
    }

    // Find super admin and add system fee to their balance
    const superAdmin = await User.findOne({
      email: envVariables.SUPER_ADMIN_EMAIL,
    }).populate("wallet");
    console.log(superAdmin);

    if (superAdmin && superAdmin.wallet) {
      // Add system fee to super admin wallet
      await Wallet.findOneAndUpdate(
        { _id: superAdmin.wallet },
        { $inc: { balance: +systemFee } },
        { session, runValidators: true }
      );

      // Update super admin's total commission
      await User.findOneAndUpdate(
        { _id: superAdmin._id },
        {
          $inc: {
            "superAdminInfo.totalCommission": +systemFee,
          },
        },
        { session }
      );
    }

    // Create transaction history with fee details
    const transactionPayload = {
      from: new Types.ObjectId(decodedToken.userId),
      to: new Types.ObjectId(receiverUser._id),
      amount: netAmount,
      type: TransactionType.SEND_MONEY,
      initiatedBy: TransactionInitiatedBy.USER,
      fromWallet: updatedSenderWallet._id,
      toWallet: updatedReceiverWallet._id,
      commission: {
        systemFee,
      },
    };

    const transactionHistory = await Transaction.create([transactionPayload], {
      session,
    });

    await session.commitTransaction();

    return {
      transaction: transactionHistory[0],
      senderWallet: updatedSenderWallet,
      receiverWallet: updatedReceiverWallet,
      fee: {
        systemFee,
        netAmount,
        totalDeduction,
      },
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// 4. Cash In → Agent → User
const cashInAgentToUser = async (
  payload: { amount: number; toWalletNumber: string },
 decodedToken: JwtPayload
) => {
  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const { amount, toWalletNumber } = payload;

    // Get agent wallet
    const agentWallet = await Wallet.findOne({
      user: new Types.ObjectId(decodedToken.userId),
      walletStatus: WALLET_STATUS.ACTIVE,
    });

    if (!agentWallet) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Agent wallet not found or blocked"
      );
    }

    // Verify agent is approved
    const agentUser = await User.findOne({
      _id: decodedToken.userId,
      role: Role.AGENT,
      "agentInfo.approvalStatus": ApprovalStatus.APPROVED,
    });

    if (!agentUser) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Agent not found or not approved"
      );
    }
    const user = await User.findOne({
      phone: toWalletNumber,
      role: Role.USER,
      isActive: IsActive.ACTIVE,
      isVerified: "true",
    });

    if (!user) {
      throw new AppError(StatusCodes.BAD_REQUEST, "User Not Found");
    }
    // Get user wallet
    const userWallet = await Wallet.findOne({
      _id: user.wallet,
      walletStatus: WALLET_STATUS.ACTIVE,
    }).populate("user");

    if (!userWallet) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "User wallet not found or blocked"
      );
    }
    // Check and update agent balance
    const updatedAgentWallet = await Wallet.balanceAvailablity(
      amount,
      agentWallet._id.toString(),
      session
    );

    if (!updatedAgentWallet) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Insufficient balance in agent wallet"
      );
    }

    // Update user balance
    const updatedUserWallet = await Wallet.findOneAndUpdate(
      { _id: user.wallet },
      { $inc: { balance: +amount } },
      { new: true, session, runValidators: true }
    );

    if (!updatedUserWallet) {
      throw new AppError(
        StatusCodes.BAD_GATEWAY,
        "Failed to update user balance"
      );
    }

    // Create transaction history
    const transactionPayload = {
      from: new Types.ObjectId(decodedToken.userId),
      to: new Types.ObjectId(user._id),
      amount,
      type: TransactionType.CASH_IN,
      initiatedBy: TransactionInitiatedBy.AGENT,
      fromWallet: updatedAgentWallet._id,
      toWallet: updatedUserWallet._id,
    };

    const transactionHistory = await Transaction.create([transactionPayload], {
      session,
    });

    await session.commitTransaction();

    return {
      transaction: transactionHistory[0],
      agentWallet: updatedAgentWallet,
      userWallet: updatedUserWallet,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// 5. Cash Out → User → Agent
const cashOutUserToAgent = async (
  payload: { amount: number; agentWalletNumber: string },
  decodedToken: JwtPayload
) => {
  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const { amount, agentWalletNumber } = payload;

    // Verify agent is approved
    const agentUser = await User.findOne({
      phone: agentWalletNumber,
      role: Role.AGENT,
      "agentInfo.approvalStatus": "approved",
    });

    if (!agentUser) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Agent not found or not approved"
      );
    }

    // Calculate fees (1.5% total commission)
    const totalCommission = amount * 0.015; // 1.5%
    const agentCommission = amount * 0.01; // 1% to agent
    const superAdminCommission = amount * 0.005; // 0.5% to super admin

    const netAmount = amount - totalCommission;

    if (netAmount <= 0) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Amount must be greater than commission fee (1.5%)"
      );
    }

    // Get user wallet
    const userWallet = await Wallet.findOne({
      user: new Types.ObjectId(decodedToken.userId),
      walletStatus: WALLET_STATUS.ACTIVE,
    });

    if (!userWallet) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "User wallet not found or blocked"
      );
    }

    // Verify user
    const user = await User.findOne({
      _id: decodedToken.userId,
      role: Role.USER,
    });

    if (!user) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Only users can cash out");
    }

    // Get agent wallet
    const agentWallet = await Wallet.findOne({
      _id: agentUser.wallet,
      walletStatus: WALLET_STATUS.ACTIVE,
    }).populate("user");

    if (!agentWallet) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Agent wallet not found or blocked"
      );
    }

    // Check and update user balance (deduct full amount including commission)
    const updatedUserWallet = await Wallet.balanceAvailablity(
      amount, // Deduct full amount including commission
      userWallet._id.toString(),
      session
    );

    if (!updatedUserWallet) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Insufficient balance in user wallet"
      );
    }

    // Update agent balance (add net amount + agent commission)
    const agentTotalAmount = netAmount + agentCommission;
    const updatedAgentWallet = await Wallet.findOneAndUpdate(
      { _id: agentUser.wallet },
      { $inc: { balance: +agentTotalAmount } },
      { new: true, session, runValidators: true }
    );

    if (!updatedAgentWallet) {
      throw new AppError(
        StatusCodes.BAD_GATEWAY,
        "Failed to update agent balance"
      );
    }

    // Update agent's total commission
    await User.findOneAndUpdate(
      { _id: agentUser._id },
      {
        $inc: {
          "agentInfo.totalCommission": +agentCommission,
        },
      },
      { session }
    );

    // Find super admin and add their commission
    const superAdmin = await User.findOne({
      role: Role.SUPER_ADMIN,
    }).populate("wallet");

    if (superAdmin && superAdmin.wallet) {
      // Add super admin commission to their wallet
      await Wallet.findOneAndUpdate(
        { _id: superAdmin.wallet },
        { $inc: { balance: +superAdminCommission } },
        { session, runValidators: true }
      );

      // Update super admin's total commission
      await User.findOneAndUpdate(
        { _id: superAdmin._id },
        {
          $inc: {
            "superAdminInfo.totalCommission": +superAdminCommission,
          },
        },
        { session }
      );
    }

    // Create transaction history with commission details
    const transactionPayload = {
      from: new Types.ObjectId(decodedToken.userId),
      to: new Types.ObjectId(agentUser._id),
      amount: netAmount, // The actual amount transferred after commission
      type: TransactionType.CASH_OUT,
      initiatedBy: TransactionInitiatedBy.USER,
      fromWallet: updatedUserWallet._id,
      toWallet: updatedAgentWallet._id,
      commission: {
        totalCommission,
        agentCommission,
        superAdminCommission,
        netAmount,
      },
    };

    const transactionHistory = await Transaction.create([transactionPayload], {
      session,
    });

    await session.commitTransaction();

    return {
      transaction: transactionHistory[0],
      userWallet: updatedUserWallet,
      agentWallet: updatedAgentWallet,
      commission: {
        totalCommission,
        agentCommission,
        superAdminCommission,
        netAmount,
      },
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const WalletService = {
  getWalletById,
  getAllWallets,
  updateWalletStatus,
  getMyWallet,
  addMoneyAdminToAgent,
  withdrawAgentToAdmin,
  sendMoneyUserToUser,
  cashInAgentToUser,
  cashOutUserToAgent,
};

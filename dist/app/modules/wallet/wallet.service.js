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
exports.WalletService = void 0;
const mongoose_1 = require("mongoose");
const wallet_model_1 = require("./wallet.model");
const transaction_model_1 = require("../transaction/transaction.model");
const transaction_interface_1 = require("../transaction/transaction.interface");
const wallet_interface_1 = require("./wallet.interface");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = require("http-status-codes");
const user_model_1 = require("../user/user.model");
const user_interface_1 = require("../user/user.interface");
const env_1 = require("../../config/env");
// Existing wallet services
const getMyWallet = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_model_1.Wallet.findOne({
        user: new mongoose_1.Types.ObjectId(userId),
    }).populate("user", "name email phone role nid agentInfo");
    if (!wallet)
        return null;
    return {
        data: wallet,
    };
});
const getAllWallets = () => __awaiter(void 0, void 0, void 0, function* () {
    const wallets = yield wallet_model_1.Wallet.find({}).populate("user");
    return {
        data: wallets,
    };
});
const getWalletById = (walletId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield wallet_model_1.Wallet.findById(walletId).populate("user");
});
const updateWalletStatus = (walletId, walletStatus) => __awaiter(void 0, void 0, void 0, function* () {
    return yield wallet_model_1.Wallet.findByIdAndUpdate(walletId, { walletStatus }, { new: true });
});
// 1. Add Money → Admin → Agent
const addMoneyAdminToAgent = (agentWalletNumber, amount, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield wallet_model_1.Wallet.startSession();
    session.startTransaction();
    try {
        const agentUser = yield user_model_1.User.findOne({
            phone: agentWalletNumber,
            role: user_interface_1.Role.AGENT,
            "agentInfo.approvalStatus": user_interface_1.ApprovalStatus.APPROVED,
        });
        if (!agentUser) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Agent not found or not approved");
        }
        // Verify agent wallet exists and is active
        const agentWallet = yield wallet_model_1.Wallet.findOne({
            _id: agentUser.wallet,
            walletStatus: wallet_interface_1.WALLET_STATUS.ACTIVE,
        }).populate("user");
        if (!agentWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Agent wallet not found or blocked");
        }
        // Find admin wallet
        const adminWallet = yield wallet_model_1.Wallet.findOne({
            user: new mongoose_1.Types.ObjectId(adminId),
            // walletStatus: WALLET_STATUS.ACTIVE,
        });
        if (!adminWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Admin wallet not found or blocked");
        }
        // Check if admin has sufficient balance
        if (adminWallet.balance < amount) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Insufficient balance in admin wallet");
        }
        // Update admin balance (deduct amount)
        const updatedAdminWallet = yield wallet_model_1.Wallet.findOneAndUpdate({ _id: adminWallet._id }, { $inc: { balance: -amount } }, { new: true, session, runValidators: true });
        if (!updatedAdminWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_GATEWAY, "Failed to update admin wallet balance");
        }
        // Update agent balance (add amount)
        const updatedAgentWallet = yield wallet_model_1.Wallet.findOneAndUpdate({ _id: agentUser.wallet }, { $inc: { balance: +amount } }, { new: true, session, runValidators: true });
        if (!updatedAgentWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_GATEWAY, "Failed to add money to agent wallet");
        }
        const transactionPayload = {
            from: new mongoose_1.Types.ObjectId(adminId),
            to: new mongoose_1.Types.ObjectId(agentUser._id),
            amount,
            type: transaction_interface_1.TransactionType.ADD_MONEY,
            initiatedBy: transaction_interface_1.TransactionInitiatedBy.ADMIN,
            fromWallet: updatedAdminWallet._id,
            toWallet: updatedAgentWallet._id,
        };
        const transactionHistory = yield transaction_model_1.Transaction.create([transactionPayload], {
            session,
        });
        yield session.commitTransaction();
        return {
            transaction: transactionHistory[0],
            adminWallet: updatedAdminWallet,
            agentWallet: updatedAgentWallet,
        };
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
// 2. Withdraw → Agent → Admin
const withdrawAgentToAdmin = (amount, agentId, adminWalletNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield wallet_model_1.Wallet.startSession();
    session.startTransaction();
    try {
        // Get agent wallet
        const agentWallet = yield wallet_model_1.Wallet.findOne({
            user: new mongoose_1.Types.ObjectId(agentId),
            // walletStatus: WALLET_STATUS.ACTIVE,
        });
        if (!agentWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Agent wallet not found or blocked");
        }
        // Verify agent is approved
        const agentUser = yield user_model_1.User.findOne({
            _id: agentId,
            role: user_interface_1.Role.AGENT,
            "agentInfo.approvalStatus": user_interface_1.ApprovalStatus.APPROVED,
        });
        if (!agentUser) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Agent not found or not approved");
        }
        //Find Admin
        const admin = yield user_model_1.User.findOne({
            phone: adminWalletNumber,
        });
        if (!admin) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Admin not found ");
        }
        // Find admin wallet
        const adminWallet = yield wallet_model_1.Wallet.findOne({
            _id: new mongoose_1.Types.ObjectId(admin.wallet),
        });
        if (!adminWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Admin wallet not found or blocked");
        }
        const updatedAgentWallet = yield wallet_model_1.Wallet.balanceAvailability(amount, agentWallet._id.toString(), session);
        if (!updatedAgentWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Insufficient balance or wallet not found");
        }
        // Update admin balance (add amount)
        const updatedAdminWallet = yield wallet_model_1.Wallet.findOneAndUpdate({ _id: adminWallet._id }, { $inc: { balance: +amount } }, { new: true, session, runValidators: true });
        if (!updatedAdminWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_GATEWAY, "Failed to update admin wallet balance");
        }
        // Create transaction history
        const transactionPayload = {
            from: new mongoose_1.Types.ObjectId(agentId),
            to: new mongoose_1.Types.ObjectId(adminWallet._id),
            amount,
            type: transaction_interface_1.TransactionType.WITHDRAW,
            initiatedBy: transaction_interface_1.TransactionInitiatedBy.AGENT,
            fromWallet: updatedAgentWallet._id,
            toWallet: updatedAdminWallet._id,
        };
        const transactionHistory = yield transaction_model_1.Transaction.create([transactionPayload], {
            session,
        });
        yield session.commitTransaction();
        return {
            transaction: transactionHistory[0],
            agentWallet: updatedAgentWallet,
            adminWallet: updatedAdminWallet,
        };
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
// 3. Send Money → User → User
const sendMoneyUserToUser = (payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield wallet_model_1.Wallet.startSession();
    session.startTransaction();
    try {
        const { amount, toWalletNumber } = payload;
        // Fixed fee for send money
        const systemFee = 5;
        const netAmount = amount - systemFee;
        if (netAmount <= 0) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Amount must be greater than system fee (5 taka)");
        }
        // Get sender wallet
        const senderWallet = yield wallet_model_1.Wallet.findOne({
            user: new mongoose_1.Types.ObjectId(decodedToken.userId),
            walletStatus: wallet_interface_1.WALLET_STATUS.ACTIVE,
        });
        if (!senderWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Sender wallet not found or blocked");
        }
        // Verify sender is a user
        const senderUser = yield user_model_1.User.findOne({
            _id: decodedToken.userId,
            role: user_interface_1.Role.USER,
        });
        if (!senderUser) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Only users can send money to other users");
        }
        const receiverUser = yield user_model_1.User.findOne({
            phone: toWalletNumber,
            role: user_interface_1.Role.USER,
        });
        if (!receiverUser) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Can only send money to users");
        }
        // Get receiver wallet
        const receiverWallet = yield wallet_model_1.Wallet.findOne({
            _id: receiverUser.wallet,
            walletStatus: wallet_interface_1.WALLET_STATUS.ACTIVE,
        }).populate("user");
        if (!receiverWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Receiver wallet not found or blocked");
        }
        // Verify receiver is a user
        // Check and update sender balance (deduct amount + fee)
        const totalDeduction = amount; // Full amount including fee
        const updatedSenderWallet = yield wallet_model_1.Wallet.balanceAvailability(totalDeduction, senderWallet._id.toString(), session);
        if (!updatedSenderWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Insufficient balance (including system fee)");
        }
        // Update receiver balance (add net amount)
        const updatedReceiverWallet = yield wallet_model_1.Wallet.findOneAndUpdate({ _id: receiverUser.wallet }, { $inc: { balance: +netAmount } }, { new: true, session, runValidators: true });
        if (!updatedReceiverWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_GATEWAY, "Failed to update receiver balance");
        }
        // Find super admin and add system fee to their balance
        const superAdmin = yield user_model_1.User.findOne({
            email: env_1.envVariables.SUPER_ADMIN_EMAIL,
        }).populate("wallet");
        console.log(superAdmin);
        if (superAdmin && superAdmin.wallet) {
            // Add system fee to super admin wallet
            yield wallet_model_1.Wallet.findOneAndUpdate({ _id: superAdmin.wallet }, { $inc: { balance: +systemFee } }, { session, runValidators: true });
            // Update super admin's total commission
            yield user_model_1.User.findOneAndUpdate({ _id: superAdmin._id }, {
                $inc: {
                    "superAdminInfo.totalCommission": +systemFee,
                },
            }, { session });
        }
        // Create transaction history with fee details
        const transactionPayload = {
            from: new mongoose_1.Types.ObjectId(decodedToken.userId),
            to: new mongoose_1.Types.ObjectId(receiverUser._id),
            amount: netAmount,
            type: transaction_interface_1.TransactionType.SEND_MONEY,
            initiatedBy: transaction_interface_1.TransactionInitiatedBy.USER,
            fromWallet: updatedSenderWallet._id,
            toWallet: updatedReceiverWallet._id,
            commission: {
                systemFee,
            },
        };
        const transactionHistory = yield transaction_model_1.Transaction.create([transactionPayload], {
            session,
        });
        yield session.commitTransaction();
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
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
// 4. Cash In → Agent → User
const cashInAgentToUser = (payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield wallet_model_1.Wallet.startSession();
    session.startTransaction();
    try {
        const { amount, toWalletNumber } = payload;
        // Get agent wallet
        const agentWallet = yield wallet_model_1.Wallet.findOne({
            user: new mongoose_1.Types.ObjectId(decodedToken.userId),
            walletStatus: wallet_interface_1.WALLET_STATUS.ACTIVE,
        });
        if (!agentWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Agent wallet not found or blocked");
        }
        // Verify agent is approved
        const agentUser = yield user_model_1.User.findOne({
            _id: decodedToken.userId,
            role: user_interface_1.Role.AGENT,
            "agentInfo.approvalStatus": user_interface_1.ApprovalStatus.APPROVED,
        });
        if (!agentUser) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Agent not found or not approved");
        }
        const user = yield user_model_1.User.findOne({
            phone: toWalletNumber,
            role: user_interface_1.Role.USER,
            isActive: user_interface_1.IsActive.ACTIVE,
            isVerified: "true",
        });
        if (!user) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User Not Found");
        }
        // Get user wallet
        const userWallet = yield wallet_model_1.Wallet.findOne({
            _id: user.wallet,
            walletStatus: wallet_interface_1.WALLET_STATUS.ACTIVE,
        }).populate("user");
        if (!userWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User wallet not found or blocked");
        }
        // Check and update agent balance
        const updatedAgentWallet = yield wallet_model_1.Wallet.balanceAvailability(amount, agentWallet._id.toString(), session);
        if (!updatedAgentWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Insufficient balance in agent wallet");
        }
        // Update user balance
        const updatedUserWallet = yield wallet_model_1.Wallet.findOneAndUpdate({ _id: user.wallet }, { $inc: { balance: +amount } }, { new: true, session, runValidators: true });
        if (!updatedUserWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_GATEWAY, "Failed to update user balance");
        }
        // Create transaction history
        const transactionPayload = {
            from: new mongoose_1.Types.ObjectId(decodedToken.userId),
            to: new mongoose_1.Types.ObjectId(user._id),
            amount,
            type: transaction_interface_1.TransactionType.CASH_IN,
            initiatedBy: transaction_interface_1.TransactionInitiatedBy.AGENT,
            fromWallet: updatedAgentWallet._id,
            toWallet: updatedUserWallet._id,
        };
        const transactionHistory = yield transaction_model_1.Transaction.create([transactionPayload], {
            session,
        });
        yield session.commitTransaction();
        return {
            transaction: transactionHistory[0],
            agentWallet: updatedAgentWallet,
            userWallet: updatedUserWallet,
        };
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
// 5. Cash Out → User → Agent
const cashOutUserToAgent = (payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield wallet_model_1.Wallet.startSession();
    session.startTransaction();
    try {
        const { amount, agentWalletNumber } = payload;
        // Verify agent is approved
        const agentUser = yield user_model_1.User.findOne({
            phone: agentWalletNumber,
            role: user_interface_1.Role.AGENT,
            "agentInfo.approvalStatus": "approved",
        });
        if (!agentUser) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Agent not found or not approved");
        }
        // Calculate fees (1.5% total commission)
        const totalCommission = amount * 0.015; // 1.5%
        const agentCommission = amount * 0.01; // 1% to agent
        const superAdminCommission = amount * 0.005; // 0.5% to super admin
        const netAmount = amount - totalCommission;
        if (netAmount <= 0) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Amount must be greater than commission fee (1.5%)");
        }
        // Get user wallet
        const userWallet = yield wallet_model_1.Wallet.findOne({
            user: new mongoose_1.Types.ObjectId(decodedToken.userId),
            walletStatus: wallet_interface_1.WALLET_STATUS.ACTIVE,
        });
        if (!userWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User wallet not found or blocked");
        }
        // Verify user
        const user = yield user_model_1.User.findOne({
            _id: decodedToken.userId,
            role: user_interface_1.Role.USER,
        });
        if (!user) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Only users can cash out");
        }
        // Get agent wallet
        const agentWallet = yield wallet_model_1.Wallet.findOne({
            _id: agentUser.wallet,
            walletStatus: wallet_interface_1.WALLET_STATUS.ACTIVE,
        }).populate("user");
        if (!agentWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Agent wallet not found or blocked");
        }
        // Check and update user balance (deduct full amount including commission)
        const updatedUserWallet = yield wallet_model_1.Wallet.balanceAvailability(amount, // Deduct full amount including commission
        userWallet._id.toString(), session);
        if (!updatedUserWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Insufficient balance in user wallet");
        }
        // Update agent balance (add net amount + agent commission)
        const agentTotalAmount = netAmount + agentCommission;
        const updatedAgentWallet = yield wallet_model_1.Wallet.findOneAndUpdate({ _id: agentUser.wallet }, { $inc: { balance: +agentTotalAmount } }, { new: true, session, runValidators: true });
        if (!updatedAgentWallet) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_GATEWAY, "Failed to update agent balance");
        }
        // Update agent's total commission
        yield user_model_1.User.findOneAndUpdate({ _id: agentUser._id }, {
            $inc: {
                "agentInfo.totalCommission": +agentCommission,
            },
        }, { session });
        // Find super admin and add their commission
        const superAdmin = yield user_model_1.User.findOne({
            role: user_interface_1.Role.SUPER_ADMIN,
        }).populate("wallet");
        if (superAdmin && superAdmin.wallet) {
            // Add super admin commission to their wallet
            yield wallet_model_1.Wallet.findOneAndUpdate({ _id: superAdmin.wallet }, { $inc: { balance: +superAdminCommission } }, { session, runValidators: true });
            // Update super admin's total commission
            yield user_model_1.User.findOneAndUpdate({ _id: superAdmin._id }, {
                $inc: {
                    "superAdminInfo.totalCommission": +superAdminCommission,
                },
            }, { session });
        }
        // Create transaction history with commission details
        const transactionPayload = {
            from: new mongoose_1.Types.ObjectId(decodedToken.userId),
            to: new mongoose_1.Types.ObjectId(agentUser._id),
            amount: netAmount, // The actual amount transferred after commission
            type: transaction_interface_1.TransactionType.CASH_OUT,
            initiatedBy: transaction_interface_1.TransactionInitiatedBy.USER,
            fromWallet: updatedUserWallet._id,
            toWallet: updatedAgentWallet._id,
            commission: {
                totalCommission,
                agentCommission,
                superAdminCommission,
                netAmount,
            },
        };
        const transactionHistory = yield transaction_model_1.Transaction.create([transactionPayload], {
            session,
        });
        yield session.commitTransaction();
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
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
exports.WalletService = {
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

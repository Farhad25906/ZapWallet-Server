// transaction.model.ts (update)
import mongoose, { Schema } from "mongoose";
import { ITransaction, TransactionType, TransactionInitiatedBy, TransactionStatus } from "./transaction.interface";

const transactionSchema = new mongoose.Schema<ITransaction>(
  {
    from: { type: Schema.Types.ObjectId, ref: "User" },
    to: { type: Schema.Types.ObjectId, ref: "User" },
    fromWallet: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
    },
    toWallet: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    initiatedBy: {
      type: String,
      enum: Object.values(TransactionInitiatedBy),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.COMPLETED,
    },
    
    commission: {
      agentCommission: { type: Number, default: 0 },
      superAdminCommission: { type: Number, default: 0 },
      systemFee: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Transaction = mongoose.model<ITransaction>(
  "transaction",
  transactionSchema
);
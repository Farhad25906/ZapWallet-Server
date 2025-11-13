// commission.interface.ts
import { Types } from "mongoose";
import { TransactionType } from "../transaction/transaction.interface";

export interface ICommissionSummary {
  totalCommission: number;
  agentCommission: number;
  cashOutFee: number;
  sendMoney: number;
  transactionCount: number;
}

export interface ICommissionTransaction {
  _id: Types.ObjectId;
  amount: number;
  type: TransactionType;
  createdAt: Date;
  commission: {
    agentCommission: number;
    superAdminCommission: number;
    systemFee: number;
  };
  from: {
    _id: Types.ObjectId;
    name: string;
    phone: string;
    role: string;
  };
  to: {
    _id: Types.ObjectId;
    name: string;
    phone: string;
    role: string;
  };
}

export interface ICommissionFilters {
  startDate?: Date;
  endDate?: Date;
  transactionType?: TransactionType;
  page?: number;
  limit?: number;
}
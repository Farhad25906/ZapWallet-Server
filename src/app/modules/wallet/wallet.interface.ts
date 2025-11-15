// wallet.interface.ts
import { Types, Model, ClientSession } from "mongoose";

export enum WALLET_STATUS {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IWallet {
   _id?: Types.ObjectId;
  user: Types.ObjectId;
  balance: number;
  currency?: string;
  walletStatus?: WALLET_STATUS;
  transactions?: Types.ObjectId[];
}

// Define the static methods interface
export interface WalletModel extends Model<IWallet> {
  balanceAvailability(
    requestedBalance: number,
    senderWallet: string,
    session: ClientSession
  ): Promise<IWallet>;
}
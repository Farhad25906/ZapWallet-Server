import mongoose, { model, Schema } from "mongoose";
import { IWallet, WALLET_STATUS } from "./wallet.interface";
import AppError from "../../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";

const walletSchema = new Schema<IWallet>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: { type: Number, required: true, default: 50 },
    currency: { type: String, default: "BDT" },
    walletStatus: {
      type: String,
      enum: Object.values(WALLET_STATUS),
      default: WALLET_STATUS.ACTIVE,
    },
    transactions: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "transaction",
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Checking Insufficient balance
walletSchema.pre("save", function (next) {
  if (this.isModified("balance") || this.isNew) {
    if (typeof this.balance === "number" && this.balance < 0) {
      return next(
        new AppError(StatusCodes.BAD_REQUEST, "Insufficient balance")
      );
    }
  }
  next();
});

//checking balance availability
walletSchema.static(
  "balanceAvailablity",
  async function (requestedBalance: number, senderWallet: string, session: mongoose.ClientSession) {
    
  
    const existingWallet = await this.findOne({ _id: senderWallet }).session(session);
    
    
    if (!existingWallet) {
     
      throw new AppError(StatusCodes.BAD_REQUEST, "Wallet not found");
    }

    
    const wallet = await this.findOneAndUpdate(
      { 
        _id: senderWallet, 
        balance: { $gte: requestedBalance } 
      },
      { $inc: { balance: -requestedBalance } },
      { runValidators: true, new: true, session }
    );



    if (!wallet) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Insufficient balance or wallet not found");
    }
    
    return wallet;
  }
);

export const Wallet = model<IWallet>("Wallet", walletSchema);

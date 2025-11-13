import { model, Schema } from "mongoose";
import {
  ApprovalStatus,
  IAgentInfo,
  IsActive,
  ISuperAdminInfo,
  IUser,
  Role,
} from "./user.interface";
const superAdminInfoSchema = new Schema<ISuperAdminInfo>(
  {
    totalCommission: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const agentInfoSchema = new Schema<IAgentInfo>(
  {
    approvalStatus: {
      type: String,
      enum: Object.values(ApprovalStatus),
      default: ApprovalStatus.PENDING,
    },
    commissionRate: {
      type: Number,
      default: 1.5,
    },
    totalCommission: {
      type: Number,
      default: 0,
      min: 0,
    },
    approvedAt: Date,
    tinId: {
      type: String,
      required: true,
      match: [
        /^\d{10}$|^\d{13}$|^\d{17}$/,
        "Please enter a valid Tin Id number",
      ],
    },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    pin: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
      required: true,
      match: [
        /^(?:\+88|88)?(01[3-9]\d{8})$/,
        "Please enter a valid Bangladeshi phone number",
      ],
    },
    nid: {
      type: String,
      unique: true,
      required: true,
      match: [/^\d{10}$|^\d{13}$|^\d{17}$/, "Please enter a valid NID number"],
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    picture: { type: String },
    address: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    isVerified: { type: Boolean, default: false },
    agentInfo: agentInfoSchema,
    superAdminInfo: superAdminInfoSchema,
    wallet: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre("save", async function (next) {
  // Remove agent info if role is not agent
  if (this.role !== Role.AGENT && this.agentInfo) {
    this.agentInfo = undefined;
  }

  // Remove super admin info if role is not super admin
  if (this.role !== Role.SUPER_ADMIN && this.superAdminInfo) {
    this.superAdminInfo = undefined;
  }

  // Validate agent info for agent role
  if (this.role === Role.AGENT && !this.agentInfo) {
    return next(new Error("Agent information is required for agent role"));
  }

  // Initialize super admin info for super admin role
  if (this.role === Role.SUPER_ADMIN && !this.superAdminInfo) {
    this.superAdminInfo = { totalCommission: 0 };
  }

  if (this.isNew && !this.wallet) {
    try {
      const { Wallet } = await import("../wallet/wallet.model");

      let initialBalance = 50;

      if (this.role === Role.SUPER_ADMIN) {
        initialBalance = 100000000;
      }

      const wallet = new Wallet({
        user: this._id,
        balance: initialBalance,
      });

      await wallet.save();
      this.wallet = wallet._id;
    } catch (error) {
      return next(error as Error);
    }
  }

  next();
});

export const User = model<IUser>("User", userSchema);

import { Types } from "mongoose";

export enum Role {
  USER = "user",
  AGENT = "agent",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

export enum IsActive {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  BLOCKED = "blocked",
}

export enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  SUSPENDED = "suspended",
}

export interface IAgentInfo {
  approvalStatus: ApprovalStatus;
  commissionRate: number;
  totalCommission: number;
  approvedAt?: Date;
  tinId: string;
}
export interface ISuperAdminInfo {
  totalCommission: number;
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  pin: string;
  phone: string;
  nid: string;
  role: Role;
  picture?: string;
  address?: string;
  isDeleted: boolean;
  isActive: IsActive;
  isVerified: boolean;
  agentInfo?: IAgentInfo;
  wallet?: Types.ObjectId;
  superAdminInfo?: ISuperAdminInfo;
  createdAt?: Date;
  updatedAt?: Date;
}

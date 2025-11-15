import httpStatus from "http-status-codes";
import { User } from "./user.model";
import { ApprovalStatus, IsActive, IUser, Role } from "./user.interface";
import AppError from "../../errorHelpers/AppError";
import bcryptjs from "bcryptjs";
import { envVariables } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

const createUser = async (payload: Partial<IUser>) => {
  const { email, pin, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
  }

  if (pin === undefined || pin === null) {
    throw new AppError(httpStatus.BAD_REQUEST, "Pin is required");
  }

  const hashedPin = await bcryptjs.hash(
    String(pin),
    Number(envVariables.BCRYPT_SALT_ROUND)
  );
  const user = await User.create({
    email,
    pin: hashedPin,
    ...rest,
  });

  return user;
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  const ifUserExist = await User.findById(userId);

  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }
  const restrictedFields = ["email", "phone", "nid", "pin"];

  if (ifUserExist.role === Role.AGENT || payload.role === Role.AGENT) {
    restrictedFields.push("agentInfo");
  }

  if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
    const attemptedRestrictedUpdates = Object.keys(payload).filter((key) =>
      restrictedFields.includes(key)
    );

    if (attemptedRestrictedUpdates.length > 0) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Restriction To Update ${attemptedRestrictedUpdates.join(
          ", "
        )}, Please Contact Help Line Number`
      );
    }
  }
  console.log(payload.role);

  if (payload.role) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }

    if (payload.role === Role.ADMIN && decodedToken.role === Role.ADMIN) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  if (payload.pin) {
    payload.pin = await bcryptjs.hash(
      payload.pin,
      envVariables.BCRYPT_SALT_ROUND
    );
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
};

const getAllUsers = async () => {
  const users = await User.find({ role: "user" });
  const totalUsers = await User.countDocuments({ role: "user" });
  return {
    data: users,
    meta: {
      total: totalUsers,
    },
  };
};

const getAllAgents = async () => {
  const users = await User.find({ role: "agent" });
  const totalUsers = await User.countDocuments({ role: "agent" });
  return {
    data: users,
    meta: {
      total: totalUsers,
    },
  };
};

const getSingleUser = async (id: string) => {
  const user = await User.findById(id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return {
    data: user,
  };
};

const getEmail = async (phone: string) => {
  const user = await User.findOne({ phone });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found with this phone number"
    );
  }

  if (!user.email) {
    throw new AppError(httpStatus.NOT_FOUND, "No email found for this user");
  }

  return {
    data: {
      email: user.email,
    },
  };
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-pin");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return {
    data: user,
  };
};
const approveAgent = async (
  userId: string,
  payload: { approvalStatus: ApprovalStatus }
) => {
  const ifUserExist = await User.findById(userId);

  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }
  if (ifUserExist.role !== Role.AGENT) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is not an agent");
  }

  const updateData = {
    $set: {
      "agentInfo.approvalStatus": payload.approvalStatus,
    },
  };

  const newUpdatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
};

const changeStatus = async (
  userId: string,
  payload: { isActive: IsActive }
) => {
  const ifUserExist = await User.findById(userId);

  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  const updateData = {
    $set: {
      isActive: payload.isActive,
    },
  };

  const newUpdatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
};

const getAllAgentRequest = async () => {
  const agents = await User.find({
    role: Role.AGENT,
    agentInfo: { $exists: true },
    "agentInfo.approvalStatus": ApprovalStatus.PENDING,
  }).select("name email phone nid agentInfo createdAt");

  const totalPendingAgents = await User.countDocuments({
    role: Role.AGENT,
    agentInfo: { $exists: true },
    "agentInfo.approvalStatus": ApprovalStatus.PENDING,
  });

  return {
    data: agents,
    meta: {
      total: totalPendingAgents,
    },
  };
};
export const UserServices = {
  createUser,
  updateUser,
  getAllUsers,
  getSingleUser,
  getMe,
  getAllAgents,
  approveAgent,
  getAllAgentRequest,
  changeStatus,
  getEmail,
};

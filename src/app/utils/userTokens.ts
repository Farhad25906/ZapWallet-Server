import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

import AppError from "../errorHelpers/AppError";
import { IsActive, IUser } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { generateToken, verifyToken } from "./jwt";
import { envVariables } from "../config/env";

export const createUserTokens = (user: Partial<IUser>) => {
//   console.log(user, "from Token Creation");

  const jwtPayload = {
    userId: user._id,
    // email: user.email,
    phone: user.phone,
    role: user.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    envVariables.JWT_ACCESS_SECRET,
    envVariables.JWT_ACCESS_EXPIRES
  );

  const refreshToken = generateToken(
    jwtPayload,
    envVariables.JWT_REFRESH_SECRET,
    envVariables.JWT_REFRESH_EXPIRES
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const createNewAccessTokenWithRefreshToken = async (
  refreshToken: string
) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    envVariables.JWT_REFRESH_SECRET
  ) as JwtPayload;

  const isUserExist = await User.findOne({ phone: verifiedRefreshToken.phone });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }
  if (
    isUserExist.isActive === IsActive.BLOCKED ||
    isUserExist.isActive === IsActive.INACTIVE
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `User is ${isUserExist.isActive}`
    );
  }
  if (isUserExist.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
  }

  const jwtPayload = {
    userId: isUserExist._id,
    // email: isUserExist.email,
    phone: isUserExist.phone,
    role: isUserExist.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    envVariables.JWT_ACCESS_SECRET,
    envVariables.JWT_ACCESS_EXPIRES
  );

  return accessToken;
};

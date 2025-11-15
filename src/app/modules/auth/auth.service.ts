import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";

import AppError from "../../errorHelpers/AppError";
import { generateToken } from "../../utils/jwt";
import { IsActive, IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import { envVariables } from "../../config/env";
import { createNewAccessTokenWithRefreshToken } from "../../utils/userTokens";
import  { JwtPayload } from "jsonwebtoken";


const credentialsLogin = async (payload: Partial<IUser>) => {
  const { phone, pin } = payload;

  // Find user by phone
  const isUserExist = await User.findOne({ phone });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "Phone Number does not exist");
  }

  if (pin === undefined || pin === null) {
    throw new AppError(httpStatus.BAD_REQUEST, "Pin is required");
  }

  // Check user status
  if (!isUserExist.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is not verified");
  }

  if (isUserExist.isActive !== IsActive.ACTIVE) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `User is ${isUserExist.isActive}`
    );
  }

  if (isUserExist.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
  }

  // Verify PIN
  const isPasswordMatched = await bcryptjs.compare(
    String(pin),
    isUserExist.pin as string
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password");
  }

  // Generate tokens
  const jwtPayload = {
    userId: isUserExist._id,
    phone: isUserExist.phone,
    role: isUserExist.role,
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

  const { pin : pass, ...userWithoutPin } = isUserExist.toObject();

  return {
    accessToken,
    refreshToken,
    user: userWithoutPin
  };
};
const resetPin = async (oldPin: string, newPin: string, decodedToken: JwtPayload) => {

    const user = await User.findById(decodedToken.userId)

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const isOldPasswordMatch = await bcryptjs.compare(oldPin, user.pin as string)
    if (!isOldPasswordMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not match");
    }

    user.pin = await bcryptjs.hash(newPin, Number(envVariables.BCRYPT_SALT_ROUND))

    await user.save();


}




const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken = await createNewAccessTokenWithRefreshToken(
    refreshToken
  );

  return {
    accessToken: newAccessToken,
  };
};
export const AuthServices = {
  credentialsLogin,
  getNewAccessToken,
  resetPin,
};

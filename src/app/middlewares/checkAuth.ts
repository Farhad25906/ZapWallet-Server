import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../errorHelpers/AppError";
import {  IsActive, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { verifyToken } from "../utils/jwt";
import { envVariables } from "../config/env";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // console.log(req.body);
      

      const accessToken = req.headers.authorization || req.cookies.accessToken;
      // console.log(accessToken);
      


      if (!accessToken) {
        throw new AppError(403, "No Token Recieved");
      }

      const verifiedToken = verifyToken(
        accessToken,
        envVariables.JWT_ACCESS_SECRET
      ) as JwtPayload;
      // console.log(verifiedToken );

      const isUserExist = await User.findOne({ phone: verifiedToken.phone  });
      // console.log(isUserExist, "From CheckAUth");

      if (isUserExist && isUserExist.role === Role.AGENT) {
        if (!isUserExist.agentInfo 
          // || isUserExist.agentInfo.approvalStatus !== ApprovalStatus.APPROVED
        ) {
          // const status = isUserExist.agentInfo?.approvalStatus ?? "unknown";
          throw new AppError(
            httpStatus.FORBIDDEN,
            `Agent account is ${status}. Please contact administrator.`
          );
        }
      }

      if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
      }
      if (!isUserExist.isVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is not verified");
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
      // console.log(verifiedToken.role);
      // console.log(authRoles);
      
      

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(403, "You are not permitted to view this route!!!");
      }

      req.user = verifiedToken;
      next();
    } catch (error) {
      console.log("jwt error", error);
      next(error);
    }
  };

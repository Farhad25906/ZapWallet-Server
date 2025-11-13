/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";
import passport from "passport";
import AppError from "../../errorHelpers/AppError";
import { createUserTokens } from "../../utils/userTokens";
import { setAuthCookie } from "../../utils/setCookie";
import { JwtPayload } from "jsonwebtoken";

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthServices.credentialsLogin(req.body)

    setAuthCookie(res, loginInfo);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged In Successfully",
        data: {
            message: "Login successful",
            user: loginInfo.user
        },
    });
})

const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    // console.log(refreshToken);
    
    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No refresh token recieved from cookies")
    }
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken as string)
    console.log(tokenInfo);
    


    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "New Access Token Retrived Successfully",
        data: tokenInfo,
    })
})
const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged Out Successfully",
        data: null,
    })
})

const resetPin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const newPin = req.body.newPin;
    const oldPin = req.body.oldPin;
    const decodedToken = req.user

    
    await AuthServices.resetPin(oldPin, newPin, decodedToken as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password Changed Successfully",
        data: null,
    })
})

export const AuthControllers = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  resetPin
};

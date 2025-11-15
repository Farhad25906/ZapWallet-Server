/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { NextFunction, Request, Response } from "express";
import { UserServices } from "./user.service";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Created Successfully",
      data: user,
    });
  }
);

const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const verifiedToken = req.user as JwtPayload;
    const userId = verifiedToken.userId;
    console.log(req.body);
    

    const payload = req.body;
    
    const user = await UserServices.updateUser(userId, payload, verifiedToken);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Updated Successfully",
      data: user,
    });
  }
);

const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    
    const decodedToken = req.user as JwtPayload;

    
    if (!decodedToken || !decodedToken.userId) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User ID not found in token");
    }

    const result = await UserServices.getMe(decodedToken.userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Your profile Retrieved Successfully",
      data: result.data,
    });
  }
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.getAllUsers();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "All Users Retrieved Successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);
const getAllAgents = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.getAllAgents();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "All Agents Retrieved Successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getAllAgentRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.getAllAgentRequest();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "All Pending Agents Retrieved Successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getSingleUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await UserServices.getSingleUser(id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Retrieved Successfully",
      data: result.data,
    });
  }
);



const getEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const phone = req.params.phone;
    const result = await UserServices.getEmail(phone);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Email Retrieved Successfully",
      data: result.data,
    });
  }
);

const approveAgent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.agentId;
    const payload = req.body;
    const user = await UserServices.approveAgent(userId, payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Agent Updated Successfully",
      data: user,
    });
  }
);

const changeStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    
    const id = req.params.id;
    const payload = req.body;
    
    const user = await UserServices.changeStatus(id, payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Updated Successfully",
      data: user,
    });
  }
);
export const UserControllers = {
  createUser,
  updateUser,
  getAllUsers,
  getAllAgents,
  getSingleUser,
  getMe,
  getEmail,
  approveAgent,
  getAllAgentRequest,
  changeStatus
};

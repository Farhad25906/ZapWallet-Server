// transaction.route.ts
import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { TransactionController } from "./transaction.controller";
import { Role } from "../user/user.interface";

const router = express.Router();

// Transaction routes
router.get("/my-transactions", checkAuth(Role.USER, Role.AGENT, Role.ADMIN, Role.SUPER_ADMIN), TransactionController.getMyTransactions);

// Add admin route for all transactions
router.get("/all", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.AGENT), TransactionController.getAllTransactions);

export const TransactionRoutes = router;
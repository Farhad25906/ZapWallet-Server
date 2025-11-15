"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRoutes = void 0;
// transaction.route.ts
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../../middlewares/checkAuth");
const transaction_controller_1 = require("./transaction.controller");
const user_interface_1 = require("../user/user.interface");
const router = express_1.default.Router();
// Transaction routes
router.get("/my-transactions", (0, checkAuth_1.checkAuth)(user_interface_1.Role.USER, user_interface_1.Role.AGENT, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), transaction_controller_1.TransactionController.getMyTransactions);
// Add admin route for all transactions
router.get("/all", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN, user_interface_1.Role.AGENT), transaction_controller_1.TransactionController.getAllTransactions);
exports.TransactionRoutes = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionRoutes = void 0;
// commission.route.ts
const express_1 = __importDefault(require("express"));
const commission_controller_1 = require("./commission.controller");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const router = express_1.default.Router();
// Agent commission routes
router.get("/agent/total", (0, checkAuth_1.checkAuth)(user_interface_1.Role.AGENT, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), commission_controller_1.CommissionController.getAgentTotalCommission);
router.get("/agent/transactions", (0, checkAuth_1.checkAuth)(user_interface_1.Role.AGENT, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), commission_controller_1.CommissionController.getAgentCommissionTransactions);
// Admin commission routes
router.get("/admin/total", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), commission_controller_1.CommissionController.getAdminTotalCommission);
router.get("/admin/transactions", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), commission_controller_1.CommissionController.getAdminCommissionTransactions);
exports.CommissionRoutes = router;

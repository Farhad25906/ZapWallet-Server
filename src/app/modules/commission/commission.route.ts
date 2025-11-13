// commission.route.ts
import express from "express";
import { CommissionController } from "./commission.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = express.Router();

// Agent commission routes
router.get(
  "/agent/total",
  checkAuth(Role.AGENT, Role.ADMIN, Role.SUPER_ADMIN),
  CommissionController.getAgentTotalCommission
);

router.get(
  "/agent/transactions",
  checkAuth(Role.AGENT, Role.ADMIN, Role.SUPER_ADMIN),
  CommissionController.getAgentCommissionTransactions
);

// Admin commission routes
router.get(
  "/admin/total",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CommissionController.getAdminTotalCommission
);

router.get(
  "/admin/transactions",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CommissionController.getAdminCommissionTransactions
);

export const CommissionRoutes = router;
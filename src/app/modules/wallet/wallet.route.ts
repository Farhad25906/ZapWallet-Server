// wallet.route.ts (add transaction routes)
import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { WalletController } from "./wallet.controller";
import { Role } from "../user/user.interface";

const router = express.Router();

// Wallet management routes
router.get("/my-wallet", checkAuth(Role.USER, Role.AGENT, Role.ADMIN, Role.SUPER_ADMIN), WalletController.getMyWallet);
router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), WalletController.getAllWallets);
router.get("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), WalletController.getWalletById);
router.patch("/status/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), WalletController.updateWalletStatus);

// Transaction routes
router.post("/add-money", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), WalletController.addMoneyToAgent);
router.post("/withdraw", checkAuth(Role.AGENT), WalletController.withdrawToAdmin);
router.post("/send-money", checkAuth(Role.USER), WalletController.sendMoney);
router.post("/cash-in", checkAuth(Role.AGENT), WalletController.cashIn);
router.post("/cash-out", checkAuth(Role.USER), WalletController.cashOut);

export const WalletRoutes = router;
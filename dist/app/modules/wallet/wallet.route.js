"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletRoutes = void 0;
// wallet.route.ts (add transaction routes)
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../../middlewares/checkAuth");
const wallet_controller_1 = require("./wallet.controller");
const user_interface_1 = require("../user/user.interface");
const router = express_1.default.Router();
// Wallet management routes
router.get("/my-wallet", (0, checkAuth_1.checkAuth)(user_interface_1.Role.USER, user_interface_1.Role.AGENT, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), wallet_controller_1.WalletController.getMyWallet);
router.get("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), wallet_controller_1.WalletController.getAllWallets);
router.get("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), wallet_controller_1.WalletController.getWalletById);
router.patch("/status/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), wallet_controller_1.WalletController.updateWalletStatus);
// Transaction routes
router.post("/add-money", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), wallet_controller_1.WalletController.addMoneyToAgent);
router.post("/withdraw", (0, checkAuth_1.checkAuth)(user_interface_1.Role.AGENT), wallet_controller_1.WalletController.withdrawToAdmin);
router.post("/send-money", (0, checkAuth_1.checkAuth)(user_interface_1.Role.USER), wallet_controller_1.WalletController.sendMoney);
router.post("/cash-in", (0, checkAuth_1.checkAuth)(user_interface_1.Role.AGENT), wallet_controller_1.WalletController.cashIn);
router.post("/cash-out", (0, checkAuth_1.checkAuth)(user_interface_1.Role.USER), wallet_controller_1.WalletController.cashOut);
exports.WalletRoutes = router;

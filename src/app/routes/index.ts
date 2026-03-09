import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { OtpRoutes } from "../modules/otp/otp.route";
import { WalletRoutes } from "../modules/wallet/wallet.route";
import { TransactionRoutes } from "../modules/transaction/transaction.route";
import { CommissionRoutes } from "../modules/commission/commission.route";
import { AIRoutes } from "../modules/ai/ai.route";

export const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/otp",
    route: OtpRoutes,
  },
  {
    path: "/wallet",
    route: WalletRoutes,
  },
  {
    path: "/transactions",
    route: TransactionRoutes,
  },
  {
    path: "/commission",
    route: CommissionRoutes,
  },
  {
    path: "/ai",
    route: AIRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

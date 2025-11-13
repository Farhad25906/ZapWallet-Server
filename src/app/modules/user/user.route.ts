import { Router } from "express";
import { UserControllers } from "./user.controller";
import { Role } from "./user.interface";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { updateUserZodSchema } from "./user.validation";

const router = Router();

router.post("/register", UserControllers.createUser);

// Specific routes should come BEFORE parameterized routes
router.get("/myInfo", checkAuth(...Object.values(Role)), UserControllers.getMe);
router.get(
  "/pending-agents",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserControllers.getAllAgentRequest
);
router.get(
  "/all-users",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserControllers.getAllUsers
);
router.get(
  "/all-agents",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserControllers.getAllAgents
);


router.get(
  "/:id",
  checkAuth(...Object.values(Role)),
  UserControllers.getSingleUser
);

router.patch(
  "/myInfo",
  validateRequest(updateUserZodSchema),
  checkAuth(...Object.values(Role)),
  UserControllers.updateUser
);

router.patch(
  "/agent-approve/:agentId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserControllers.approveAgent
);

router.patch(
  "/change-status/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserControllers.changeStatus
);

export const UserRoutes = router;

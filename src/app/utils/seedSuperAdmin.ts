import bcryptjs from "bcryptjs";
import { IsActive, IUser, Role } from "../modules/user/user.interface";

import { envVariables } from "../config/env";
import { User } from "../modules/user/user.model";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await User.findOne({
      email: envVariables.SUPER_ADMIN_EMAIL,
    });

    if (isSuperAdminExist) {
      console.log("Super Admin Already Exists!");
      return;
    }

    console.log("Trying to create Super Admin...");

    const hashedPassword = await bcryptjs.hash(
      envVariables.SUPER_ADMIN_PASSWORD,
      Number(envVariables.BCRYPT_SALT_ROUND)
    );

    const payload: IUser = {
      name: "Super admin",
      role: Role.SUPER_ADMIN,
      email: envVariables.SUPER_ADMIN_EMAIL,
      pin: hashedPassword,
      isVerified: true,
      phone: envVariables.SUPER_ADMIN_PHONE,
      nid: "8274567891",
      isDeleted: false,
      isActive: IsActive.ACTIVE,
    };

    const superadmin = await User.create(payload);
    // console.log("Super Admin Created Successfuly! \n");
    console.log(superadmin);
  } catch (error) {
    console.log(error);
  }
};

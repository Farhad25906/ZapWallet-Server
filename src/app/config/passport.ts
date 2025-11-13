/* eslint-disable @typescript-eslint/no-explicit-any */
import bcryptjs from "bcryptjs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { IsActive } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";

passport.use(
  'local',
  new LocalStrategy(
    {
      usernameField: "phone",
      passwordField: "pin",
    },
    async (phone: string, pin: string, done) => {
      try {
        const isUserExist = await User.findOne({ phone });

        if (!isUserExist) {
          return done(null, false, {
            message: "User with this phone number does not exist",
          });
        }

        if (!isUserExist.isVerified) {
          return done(null, false, { message: "User is not verified" });
        }

        if (
          isUserExist.isActive === IsActive.BLOCKED ||
          isUserExist.isActive === IsActive.INACTIVE ||
          isUserExist.isActive === IsActive.SUSPENDED
        ) {
          return done(null, false, {
            message: `User is ${isUserExist.isActive}`,
          });
        }

        if (isUserExist.isDeleted) {
          return done(null, false, { message: "User is deleted" });
        }

        // Verify PIN
        const isPinMatched = await bcryptjs.compare(pin, isUserExist.pin);

        if (!isPinMatched) {
          return done(null, false, { message: "PIN does not match" });
        }

        return done(null, isUserExist);
      } catch (error) {
        console.log(error);
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.log(error);
    done(error);
  }
});

export default passport;

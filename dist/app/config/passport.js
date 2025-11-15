"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const user_interface_1 = require("../modules/user/user.interface");
const user_model_1 = require("../modules/user/user.model");
passport_1.default.use('local', new passport_local_1.Strategy({
    usernameField: "phone",
    passwordField: "pin",
}, (phone, pin, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isUserExist = yield user_model_1.User.findOne({ phone });
        if (!isUserExist) {
            return done(null, false, {
                message: "User with this phone number does not exist",
            });
        }
        if (!isUserExist.isVerified) {
            return done(null, false, { message: "User is not verified" });
        }
        if (isUserExist.isActive === user_interface_1.IsActive.BLOCKED ||
            isUserExist.isActive === user_interface_1.IsActive.INACTIVE ||
            isUserExist.isActive === user_interface_1.IsActive.SUSPENDED) {
            return done(null, false, {
                message: `User is ${isUserExist.isActive}`,
            });
        }
        if (isUserExist.isDeleted) {
            return done(null, false, { message: "User is deleted" });
        }
        // Verify PIN
        const isPinMatched = yield bcryptjs_1.default.compare(pin, isUserExist.pin);
        if (!isPinMatched) {
            return done(null, false, { message: "PIN does not match" });
        }
        return done(null, isUserExist);
    }
    catch (error) {
        console.log(error);
        return done(error);
    }
})));
passport_1.default.serializeUser((user, done) => {
    done(null, user._id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findById(id);
        done(null, user);
    }
    catch (error) {
        console.log(error);
        done(error);
    }
}));
exports.default = passport_1.default;

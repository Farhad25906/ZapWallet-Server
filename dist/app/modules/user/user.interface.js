"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalStatus = exports.IsActive = exports.Role = void 0;
var Role;
(function (Role) {
    Role["USER"] = "user";
    Role["AGENT"] = "agent";
    Role["ADMIN"] = "admin";
    Role["SUPER_ADMIN"] = "super_admin";
})(Role || (exports.Role = Role = {}));
var IsActive;
(function (IsActive) {
    IsActive["ACTIVE"] = "active";
    IsActive["INACTIVE"] = "inactive";
    IsActive["SUSPENDED"] = "suspended";
    IsActive["BLOCKED"] = "blocked";
})(IsActive || (exports.IsActive = IsActive = {}));
var ApprovalStatus;
(function (ApprovalStatus) {
    ApprovalStatus["PENDING"] = "pending";
    ApprovalStatus["APPROVED"] = "approved";
    ApprovalStatus["REJECTED"] = "rejected";
    ApprovalStatus["SUSPENDED"] = "suspended";
})(ApprovalStatus || (exports.ApprovalStatus = ApprovalStatus = {}));

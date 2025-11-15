"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionStatus = exports.TransactionType = exports.TransactionInitiatedBy = void 0;
var TransactionInitiatedBy;
(function (TransactionInitiatedBy) {
    TransactionInitiatedBy["USER"] = "USER";
    TransactionInitiatedBy["AGENT"] = "AGENT";
    TransactionInitiatedBy["ADMIN"] = "ADMIN";
})(TransactionInitiatedBy || (exports.TransactionInitiatedBy = TransactionInitiatedBy = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["SEND_MONEY"] = "SEND_MONEY";
    TransactionType["CASH_IN"] = "CASH_IN";
    TransactionType["CASH_OUT"] = "CASH_OUT";
    TransactionType["ADD_MONEY"] = "ADD_MONEY";
    TransactionType["WITHDRAW"] = "WITHDRAW";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["COMPLETED"] = "COMPLETED";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["CANCELLED"] = "CANCELLED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));

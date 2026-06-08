"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PREFERENCE_SET_ID = exports.buildUpdateParam = void 0;
function buildUpdateParam(param) {
    if (typeof param === "object") {
        return param;
    }
    return { subscribed: param };
}
exports.buildUpdateParam = buildUpdateParam;
exports.DEFAULT_PREFERENCE_SET_ID = "default";

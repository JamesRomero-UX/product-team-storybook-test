"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEventPropertyAttributionEnabled = exports.isUserPropertyAttributionEnabled = exports.hasTrackingMethod = exports.normalizeTrackingMethod = exports.EVENT_PROPERTY_TRACKING_METHOD = exports.USER_PROPERTY_TRACKING_METHOD = void 0;
var tslib_1 = require("tslib");
exports.USER_PROPERTY_TRACKING_METHOD = 'userProperty';
exports.EVENT_PROPERTY_TRACKING_METHOD = 'eventProperty';
var isTrackingMethod = function (value) {
    return value === exports.USER_PROPERTY_TRACKING_METHOD || value === exports.EVENT_PROPERTY_TRACKING_METHOD;
};
/**
 * Normalizes attribution tracking methods from runtime config, drops unsupported values,
 * and falls back to the legacy default when nothing valid is provided.
 */
var normalizeTrackingMethod = function (trackingMethod) {
    var normalized = tslib_1.__spreadArray([], tslib_1.__read(new Set((Array.isArray(trackingMethod) ? trackingMethod : [trackingMethod]).filter(isTrackingMethod))), false);
    return normalized.length > 0 ? normalized : [exports.USER_PROPERTY_TRACKING_METHOD];
};
exports.normalizeTrackingMethod = normalizeTrackingMethod;
var hasTrackingMethod = function (options, trackingMethod) {
    return (0, exports.normalizeTrackingMethod)(options.trackingMethod).includes(trackingMethod);
};
exports.hasTrackingMethod = hasTrackingMethod;
var isUserPropertyAttributionEnabled = function (options) {
    return (0, exports.hasTrackingMethod)(options, exports.USER_PROPERTY_TRACKING_METHOD);
};
exports.isUserPropertyAttributionEnabled = isUserPropertyAttributionEnabled;
var isEventPropertyAttributionEnabled = function (options) {
    return (0, exports.hasTrackingMethod)(options, exports.EVENT_PROPERTY_TRACKING_METHOD);
};
exports.isEventPropertyAttributionEnabled = isEventPropertyAttributionEnabled;
//# sourceMappingURL=tracking-methods.js.map
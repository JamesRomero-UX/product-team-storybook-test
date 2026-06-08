import { __read, __spreadArray } from "tslib";
export var USER_PROPERTY_TRACKING_METHOD = 'userProperty';
export var EVENT_PROPERTY_TRACKING_METHOD = 'eventProperty';
var isTrackingMethod = function (value) {
    return value === USER_PROPERTY_TRACKING_METHOD || value === EVENT_PROPERTY_TRACKING_METHOD;
};
/**
 * Normalizes attribution tracking methods from runtime config, drops unsupported values,
 * and falls back to the legacy default when nothing valid is provided.
 */
export var normalizeTrackingMethod = function (trackingMethod) {
    var normalized = __spreadArray([], __read(new Set((Array.isArray(trackingMethod) ? trackingMethod : [trackingMethod]).filter(isTrackingMethod))), false);
    return normalized.length > 0 ? normalized : [USER_PROPERTY_TRACKING_METHOD];
};
export var hasTrackingMethod = function (options, trackingMethod) {
    return normalizeTrackingMethod(options.trackingMethod).includes(trackingMethod);
};
export var isUserPropertyAttributionEnabled = function (options) {
    return hasTrackingMethod(options, USER_PROPERTY_TRACKING_METHOD);
};
export var isEventPropertyAttributionEnabled = function (options) {
    return hasTrackingMethod(options, EVENT_PROPERTY_TRACKING_METHOD);
};
//# sourceMappingURL=tracking-methods.js.map
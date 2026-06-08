"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventPropertyTrackingPlugin = void 0;
var tslib_1 = require("tslib");
var analytics_core_1 = require("@amplitude/analytics-core");
var ATTRIBUTION_EVENT_TYPE = '[Amplitude] Attribution';
var EVENT_PROPERTY_EXCLUDED_EVENT_TYPES = new Set([
    analytics_core_1.SpecialEventType.IDENTIFY,
    analytics_core_1.SpecialEventType.GROUP_IDENTIFY,
]);
var toEventPropertyCampaign = function (campaign) { return (0, analytics_core_1.omitUndefined)(campaign); };
var eventPropertyTrackingPlugin = function (options) {
    var _a;
    if (options === void 0) { options = {}; }
    var fallbackAttributionEvent = (_a = options.fallbackAttributionEvent) !== null && _a !== void 0 ? _a : false;
    var globalScope = (0, analytics_core_1.getGlobalScope)();
    var amplitude;
    var loggerProvider;
    var eventPropertyCampaign = {};
    var isTracking = false;
    var isProxied = false;
    var originalPushState;
    var originalReplaceState;
    var installedPushState;
    var installedReplaceState;
    var updateCampaignState = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var currentCampaign;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new analytics_core_1.CampaignParser().parse()];
                case 1:
                    currentCampaign = _a.sent();
                    eventPropertyCampaign = toEventPropertyCampaign(currentCampaign);
                    if (fallbackAttributionEvent) {
                        /* istanbul ignore next */
                        loggerProvider === null || loggerProvider === void 0 ? void 0 : loggerProvider.log('Tracking attribution fallback event.');
                        /* istanbul ignore next */
                        amplitude === null || amplitude === void 0 ? void 0 : amplitude.track(ATTRIBUTION_EVENT_TYPE, eventPropertyCampaign);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var onHistoryChange = function () {
        // CampaignParser.parse() is async by type, but its current implementation computes synchronously.
        // In the Browser SDK, this history-triggered refresh starts immediately and reaches its continuation
        // before Timeline.scheduleApply(0) runs event enrichment, so pushState()/replaceState() followed by
        // track() in the same tick does not currently race. Revisit this assumption if campaign parsing or
        // timeline scheduling becomes truly async in the future.
        void updateCampaignState();
    };
    var createHistoryStateProxy = function (method) {
        return new Proxy(method, {
            apply: function (target, thisArg, args) {
                Reflect.apply(target, thisArg, args);
                if (isTracking) {
                    onHistoryChange();
                }
            },
        });
    };
    return {
        name: '@amplitude/plugin-event-property-attribution-browser',
        type: 'enrichment',
        setup: function (config, client) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        amplitude = client;
                        loggerProvider = config.loggerProvider;
                        isTracking = true;
                        loggerProvider.log('Installing event property attribution tracking.');
                        return [4 /*yield*/, updateCampaignState()];
                    case 1:
                        _a.sent();
                        if (!globalScope) {
                            return [2 /*return*/];
                        }
                        globalScope.addEventListener('popstate', onHistoryChange);
                        if (!isProxied) {
                            // There is no global browser listener for history mutations, so proxy both methods.
                            originalPushState = Reflect.get(globalScope.history, 'pushState');
                            originalReplaceState = Reflect.get(globalScope.history, 'replaceState');
                            /* istanbul ignore next */
                            if (!originalPushState || !originalReplaceState) {
                                return [2 /*return*/];
                            }
                            installedPushState = createHistoryStateProxy(originalPushState);
                            globalScope.history.pushState = installedPushState;
                            installedReplaceState = createHistoryStateProxy(originalReplaceState);
                            globalScope.history.replaceState = installedReplaceState;
                            isProxied = true;
                        }
                        return [2 /*return*/];
                }
            });
        }); },
        execute: function (event) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                if (EVENT_PROPERTY_EXCLUDED_EVENT_TYPES.has(event.event_type)) {
                    return [2 /*return*/, event];
                }
                event.event_properties = tslib_1.__assign(tslib_1.__assign({}, eventPropertyCampaign), event.event_properties);
                return [2 /*return*/, event];
            });
        }); },
        teardown: function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            var currentPushState, currentReplaceState;
            return tslib_1.__generator(this, function (_a) {
                if (globalScope) {
                    globalScope.removeEventListener('popstate', onHistoryChange);
                    currentPushState = Reflect.get(globalScope.history, 'pushState');
                    currentReplaceState = Reflect.get(globalScope.history, 'replaceState');
                    if (isProxied && currentPushState === installedPushState && originalPushState) {
                        globalScope.history.pushState = originalPushState;
                    }
                    if (isProxied && currentReplaceState === installedReplaceState && originalReplaceState) {
                        globalScope.history.replaceState = originalReplaceState;
                    }
                }
                isTracking = false;
                isProxied = false;
                originalPushState = undefined;
                originalReplaceState = undefined;
                installedPushState = undefined;
                installedReplaceState = undefined;
                eventPropertyCampaign = {};
                return [2 /*return*/];
            });
        }); },
    };
};
exports.eventPropertyTrackingPlugin = eventPropertyTrackingPlugin;
//# sourceMappingURL=event-property-tracking.js.map
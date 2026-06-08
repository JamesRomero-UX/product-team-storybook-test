"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performancePlugin = void 0;
var tslib_1 = require("tslib");
var constants = tslib_1.__importStar(require("./constants"));
var track_long_task_1 = require("./autocapture/track-long-task");
var DEFAULT_DURATION_THRESHOLD = 100; // ms
var performancePlugin = function (options) {
    if (options === void 0) { options = {}; }
    var name = constants.PERFORMANCE_PLUGIN_NAME;
    var type = 'enrichment';
    var subscriptions = [];
    var mainThreadBlockEnabled = options.mainThreadBlock === true ||
        (typeof options.mainThreadBlock === 'object' && options.mainThreadBlock !== null);
    var setup = function (config, amplitude) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var durationThreshold, subscription;
        var _a;
        return tslib_1.__generator(this, function (_b) {
            /* istanbul ignore if */
            if (typeof document === 'undefined') {
                return [2 /*return*/];
            }
            if (mainThreadBlockEnabled) {
                durationThreshold = DEFAULT_DURATION_THRESHOLD;
                if (typeof options.mainThreadBlock === 'object' && options.mainThreadBlock.durationThreshold !== undefined) {
                    durationThreshold = options.mainThreadBlock.durationThreshold;
                }
                subscription = (0, track_long_task_1.trackMainThreadBlock)({
                    amplitude: amplitude,
                    options: options,
                    durationThreshold: durationThreshold,
                });
                subscriptions.push(subscription);
            }
            /* istanbul ignore next */
            (_a = config === null || config === void 0 ? void 0 : config.loggerProvider) === null || _a === void 0 ? void 0 : _a.log("".concat(name, " performance tracking has been successfully added."));
            return [2 /*return*/];
        });
    }); };
    var execute = function (event) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, event];
        });
    }); };
    var teardown = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var subscriptions_1, subscriptions_1_1, subscription;
        var e_1, _a;
        return tslib_1.__generator(this, function (_b) {
            try {
                for (subscriptions_1 = tslib_1.__values(subscriptions), subscriptions_1_1 = subscriptions_1.next(); !subscriptions_1_1.done; subscriptions_1_1 = subscriptions_1.next()) {
                    subscription = subscriptions_1_1.value;
                    subscription.unsubscribe();
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (subscriptions_1_1 && !subscriptions_1_1.done && (_a = subscriptions_1.return)) _a.call(subscriptions_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return [2 /*return*/];
        });
    }); };
    return {
        name: name,
        type: type,
        setup: setup,
        execute: execute,
        teardown: teardown,
    };
};
exports.performancePlugin = performancePlugin;
//# sourceMappingURL=performance-plugin.js.map
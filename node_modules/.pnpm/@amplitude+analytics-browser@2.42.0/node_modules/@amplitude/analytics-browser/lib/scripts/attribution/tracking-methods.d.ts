import { AttributionOptions, TrackingMethod } from '@amplitude/analytics-core';
export declare const USER_PROPERTY_TRACKING_METHOD: TrackingMethod;
export declare const EVENT_PROPERTY_TRACKING_METHOD: TrackingMethod;
/**
 * Normalizes attribution tracking methods from runtime config, drops unsupported values,
 * and falls back to the legacy default when nothing valid is provided.
 */
export declare const normalizeTrackingMethod: (trackingMethod?: unknown) => TrackingMethod[];
export declare const hasTrackingMethod: (options: AttributionOptions, trackingMethod: TrackingMethod) => boolean;
export declare const isUserPropertyAttributionEnabled: (options: AttributionOptions) => boolean;
export declare const isEventPropertyAttributionEnabled: (options: AttributionOptions) => boolean;
//# sourceMappingURL=tracking-methods.d.ts.map
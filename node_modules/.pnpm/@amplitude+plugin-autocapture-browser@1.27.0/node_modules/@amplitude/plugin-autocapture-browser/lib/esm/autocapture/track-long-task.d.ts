import { BrowserClient, PerformanceTrackingOptions } from '@amplitude/analytics-core';
export declare function trackMainThreadBlock({ amplitude, options, durationThreshold, }: {
    amplitude: BrowserClient;
    options: PerformanceTrackingOptions;
    durationThreshold?: number;
}): {
    unsubscribe: () => void;
};
//# sourceMappingURL=track-long-task.d.ts.map
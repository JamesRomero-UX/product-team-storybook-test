import { BrowserClient, BrowserConfig, EnrichmentPlugin, PerformanceTrackingOptions } from '@amplitude/analytics-core';
type BrowserEnrichmentPlugin = EnrichmentPlugin<BrowserClient, BrowserConfig>;
export declare const performancePlugin: (options?: PerformanceTrackingOptions) => BrowserEnrichmentPlugin;
export {};
//# sourceMappingURL=performance-plugin.d.ts.map
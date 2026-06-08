# Analytics Provider Architecture - Segment + Amplitude Integration

## Overview

The analytics system has been refactored to support both Segment and Amplitude analytics providers while maintaining a single entry point for the application.

## Architecture

### Separate Providers

1. **SegmentProvider** (`SegmentProvider.tsx`)
   - Manages Segment analytics initialization
   - Provides Segment client through React context
   - Uses `AnalyticsBrowser.load()` to initialize

2. **AmplitudeProvider** (`AmplitudeProvider.tsx`)
   - Manages Amplitude analytics initialization
   - Provides Amplitude client through React context
   - Uses `amplitude.init()` to initialize

### Unified Entry Point

**AnalyticsProvider** (`segment.provider.tsx`)
- Wraps both SegmentProvider and AmplitudeProvider
- Maintains the same API for consumers
- Takes both `writeKey` (Segment) and `amplitudeKey` (Amplitude)

```tsx
<AnalyticsProvider
  writeKey={segmentKey}
  amplitudeKey={amplitudeKey}
>
  {children}
</AnalyticsProvider>
```

### Hooks

1. **useSegment** (`useSegment.hook.ts`)
   - Provides access to Segment analytics client
   - Throws error if used outside SegmentProvider

2. **useAmplitude** (`useAmplitude.hook.ts`)
   - Provides access to Amplitude analytics client
   - Throws error if used outside AmplitudeProvider

3. **useAnalytics** (`useAnalytics.ts`)
   - Provides access to both analytics clients
   - Returns `{ segment, amplitude }`
   - Re-exports individual hooks for convenience

## Usage

### Basic Setup

```tsx
// In your app root
<AnalyticsProvider
  writeKey={process.env.REACT_APP_SEGMENT_KEY}
  amplitudeKey={process.env.REACT_APP_AMPLITUDE_KEY}
>
  <App />
</AnalyticsProvider>
```

### In Components

```tsx
// Use both analytics providers
const { segment, amplitude } = useAnalytics();

// Or use individual providers
const segment = useSegment();
const amplitude = useAmplitude();
```

### Tracking Implementation

The tracking hooks (`useBaseTracking`, `useUserTracking`) automatically send events to both Segment and Amplitude:

- **Page views**: Sent to both providers
- **User identification**: Sent to both providers
- **Group/organization tracking**: Sent to both providers

## API Differences

### Segment API
- `segment.page()` - Track page views
- `segment.identify()` - Identify users
- `segment.group()` - Track groups

### Amplitude API
- `amplitude.track()` - Track events
- `amplitude.setUserId()` - Set user ID
- `amplitude.identify()` - Set user properties using Identify object
- `amplitude.setGroup()` - Set group properties

## Files Structure

```
packages/components/segment/
├── AmplitudeContext.ts          # Amplitude context definition
├── AmplitudeProvider.tsx        # Amplitude provider component
├── AnalyticsContext.ts          # Legacy context (may be removed)
├── SegmentContext.ts            # Segment context definition
├── SegmentProvider.tsx          # Segment provider component
├── segment.control.tsx          # Tracking hooks implementation
├── segment.provider.tsx         # Unified analytics provider
├── segment.user.provider.tsx    # User tracking provider
├── useAmplitude.hook.ts         # Amplitude hook
├── useAnalytics.ts              # Combined analytics hook
├── useSegment.hook.ts           # Segment hook
└── index.ts                     # Exports
```

## Environment Variables

- `REACT_APP_SEGMENT_KEY` - Segment write key
- `REACT_APP_AMPLITUDE_API_KEY` - Amplitude API key

## Benefits

1. **Separation of Concerns**: Each provider is independent
2. **Flexibility**: Can use either provider individually or together
3. **Backward Compatibility**: Existing code using `useAnalytics()` continues to work
4. **Type Safety**: Full TypeScript support for both providers
5. **Error Handling**: Proper error boundaries for each provider
xx
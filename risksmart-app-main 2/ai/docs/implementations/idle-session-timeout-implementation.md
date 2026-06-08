# Idle Session Timeout Implementation

## Overview

The `IdleSessionTimeout` component has been successfully integrated into the RiskSmart web application to provide automatic logout functionality when users are inactive for a configurable period of time.

## Implementation Details

### Location

- **Component**: `/packages/web/src/components/IdleTimer/IdleSessionTimeout.tsx`
- **Integration**: Added to `/packages/web/src/Providers.tsx` to wrap all authenticated content

### Key Features

1. **Configurable Timeout**:
   - Reads timeout duration from Auth0 JWT claims (`claims_organization_idle_timeout`)
   - Falls back to 4 hours (14400 seconds) if no claim is provided
   - Ensures timeout is greater than the warning prompt duration

2. **Cross-Tab Synchronization**:
   - Uses `crossTab: true` to sync idle state across browser tabs
   - `syncTimers: 500` ensures smooth synchronization every 500ms

3. **Warning System**:
   - Shows a modal warning 1 minute before logout
   - Displays real-time countdown of remaining seconds
   - Updates every 500ms for smooth countdown

4. **User Actions**:
   - **Stay Logged In**: Resets the idle timer and closes the warning
   - **Log Out**: Immediately logs out the user
   - **Activity Detection**: Any user interaction automatically resets the timer

5. **Auth0 Integration**:
   - Uses `useAuth0` hook for accessing claims and logout functionality
   - Logout redirects back to the application origin
   - Follows Auth0 best practices for session management

### Technical Implementation

```tsx
// Key configuration
const PROMPT_DURATION_MS = 60 * 1000; // 1 minute warning
const defaultTimeout = 14400 * 1000; // 4 hours default

// Cross-tab idle timer setup
const { getRemainingTime, activate } = useIdleTimer({
  onIdle: handleOnIdle,
  onActive: handleOnActive,
  onPrompt: handleOnPrompt,
  timeout: timeoutDuration,
  promptBeforeIdle: PROMPT_DURATION_MS,
  throttle: 500,
  crossTab: true,
  syncTimers: 500,
});
```

### Auth0 Claims Configuration

The component expects an Auth0 claim named `claims_organization_idle_timeout` that contains the timeout duration in seconds. This should be configured in your Auth0 tenant's custom claims.

Example claim value: `"14400"` (4 hours in seconds)

### Integration Architecture

The component is integrated at the provider level in `Providers.tsx`, ensuring it's available across all authenticated routes:

```tsx
<AuthProvider>
  <TrpcProvider>
    <AnalyticsUserProvider>
      <NotificationProvider>
        <AxiosProvider>
          <ApolloGraphqlProvider>
            <IdleSessionTimeout />
            <UpdatePrompt />
            <Outlet />
          </ApolloGraphqlProvider>
        </AxiosProvider>
      </NotificationProvider>
    </AnalyticsUserProvider>
  </TrpcProvider>
</AuthProvider>
```

### Benefits

1. **Security**: Automatically logs out inactive users to prevent unauthorized access
2. **User-Friendly**: Provides clear warning with option to extend session
3. **Cross-Tab Awareness**: Prevents conflicts when user has multiple tabs open
4. **Configurable**: Organization-specific timeout durations via Auth0 claims
5. **Accessible**: Uses proper ARIA labels and semantic HTML structure

### Dependencies

- `react-idle-timer`: For idle detection and cross-tab synchronization
- `@auth0/auth0-react`: For authentication and logout functionality
- `@risksmart-app/components`: For UI components (Modal, Button, etc.)

## Testing Recommendations

1. **Timeout Functionality**: Test with shorter timeout values during development
2. **Cross-Tab Behavior**: Open multiple tabs and verify synchronization
3. **Warning Display**: Ensure modal appears exactly 1 minute before logout
4. **User Actions**: Test both "Stay Logged In" and "Log Out" buttons
5. **Claims Integration**: Verify timeout values are read correctly from Auth0 claims

## Future Enhancements

1. **Configurable Warning Duration**: Allow customization of the 1-minute warning period
2. **Activity Logging**: Track user activity patterns for analytics
3. **Grace Period**: Add a short grace period after logout warning
4. **Accessibility Improvements**: Enhanced screen reader support for countdown

## Monitoring

The implementation includes proper error handling and console warnings. Monitor for:

- Auth0 claim parsing errors
- Timer synchronization issues across tabs
- Network connectivity problems during logout

## Configuration

To modify the default timeout or warning duration, update the constants in `IdleSessionTimeout.tsx`:

```tsx
const PROMPT_DURATION_MS = 60 * 1000; // Warning duration
const defaultTimeout = 14400 * 1000; // Default timeout if no claim
```

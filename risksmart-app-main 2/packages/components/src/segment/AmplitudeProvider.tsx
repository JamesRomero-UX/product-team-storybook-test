import * as amplitude from '@amplitude/analytics-browser';
import type { EnrichmentPlugin } from '@amplitude/analytics-browser/lib/esm/types';
import type { JSX, ReactNode } from 'react';
import { useEffect, useRef } from 'react';

import useRisksmartUser from '../hooks/useRisksmartUser';
import { hasuraClaimsNamespace, hasuraDefaultRole } from '../rbac/jwt';
import { AmplitudeContext } from './AmplitudeContext';

interface AmplitudeProviderProps {
  apiKey: string;
  children: ReactNode;
}

// Creates a plugin capturing secure page/title & group assignment.
const enrichPageUrlPlugin = (): EnrichmentPlugin => {
  return {
    name: 'enrichPageUrlPlugin',
    setup: async () => undefined,
    execute: async (amplitudeEvent) => {
      if (amplitudeEvent.event_type === '$identify') {
        return amplitudeEvent;
      }

      if (amplitudeEvent.event_type === '$groupidentify') {
        return amplitudeEvent;
      }

      amplitudeEvent.event_properties = {
        ...amplitudeEvent.event_properties,
        '[Amplitude] Page Title': 'Removed due to security',
      };

      return amplitudeEvent;
    },
  };
};

export const AmplitudeProvider = (
  props: AmplitudeProviderProps
): JSX.Element => {
  const { isAuthenticated, user } = useRisksmartUser();
  const prevOrgKeyRef = useRef<string | undefined>(undefined);

  // Destructure all user-derived primitives used by effects for clearer dependencies.
  const orgKey = user?.orgKey;
  const userId = user?.userId;
  const email = user?.claims_email;
  const username = user?.claims_username;
  const orgRole = user?.[hasuraClaimsNamespace]?.[hasuraDefaultRole];
  const isCustomerSupport = user?.isCustomerSupport;
  const claimsOrgName = user?.claims_organization_name;
  const claimsTenant = user?.claims_tenant;

  // Effect 1: Initialize Amplitude when orgKey first becomes available or changes.
  useEffect(() => {
    if (!isAuthenticated || !orgKey) {
      return;
    }

    if (prevOrgKeyRef.current === orgKey) {
      return; // orgKey unchanged, no re-init required.
    }

    prevOrgKeyRef.current = orgKey;

    amplitude.add(enrichPageUrlPlugin());

    amplitude.init(props.apiKey, {
      autocapture: {
        attribution: false,
        pageViews: false, // manual page tracking via hooks
        sessions: true,
        formInteractions: false,
        fileDownloads: false,
        elementInteractions: true,
        networkTracking: false,
      },
    });
  }, [props.apiKey, isAuthenticated, orgKey]);

  // Effect 2: Identify user & group properties when any relevant user info changes (while authenticated & scoped to orgKey).
  useEffect(() => {
    if (!isAuthenticated || !orgKey) {
      return;
    }

    // User identification
    if (userId) {
      void amplitude.setUserId(userId);
      const identifyEvent = new amplitude.Identify();
      if (email) {
        identifyEvent.set('email', email);
      }
      if (username) {
        identifyEvent.set('name', username);
      }
      if (orgRole) {
        identifyEvent.set('org_role', orgRole);
      }
      identifyEvent.set('isCustomerSupport', !!isCustomerSupport);
      amplitude.identify(identifyEvent);

      amplitude.setGroup('organization', orgKey);
    }

    // Group identification
    if (claimsOrgName || claimsTenant) {
      const groupIdentifyEvent = new amplitude.Identify();
      if (claimsOrgName) {
        groupIdentifyEvent.set('name', claimsOrgName);
      }
      if (claimsTenant) {
        groupIdentifyEvent.set('tenant', claimsTenant);
      }
      amplitude.groupIdentify('organization', orgKey, groupIdentifyEvent);
    }
  }, [
    isAuthenticated,
    orgKey,
    userId,
    email,
    username,
    orgRole,
    isCustomerSupport,
    claimsOrgName,
    claimsTenant,
  ]);

  return (
    <AmplitudeContext.Provider value={amplitude}>
      {props.children}
    </AmplitudeContext.Provider>
  );
};

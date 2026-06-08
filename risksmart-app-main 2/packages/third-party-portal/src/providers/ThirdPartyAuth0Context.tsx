import type { Auth0ContextInterface } from '@auth0/auth0-react';
import { initialContext } from '@auth0/auth0-react';
import { createContext } from 'react';

export const ThirdPartyAuth0Context =
  createContext<Auth0ContextInterface>(initialContext);

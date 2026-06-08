export interface User<A = AppMetadata, U = UserMetadata> {
  email?: string | undefined;
  email_verified?: boolean | undefined;
  username?: string | undefined;
  phone_number?: string | undefined;
  phone_verified?: boolean | undefined;
  user_id?: string | undefined;
  _id?: string | undefined;
  created_at?: string | undefined;
  updated_at?: string | undefined;
  identities?: Identity[] | undefined;
  app_metadata?: A | undefined;
  user_metadata?: U | undefined;
  picture?: string | undefined;
  name?: string | undefined;
  nickname?: string | undefined;
  multifactor?: string[] | undefined;
  last_ip?: string | undefined;
  last_login?: string | undefined;
  last_password_reset?: string | undefined;
  logins_count?: number | undefined;
  blocked?: boolean | undefined;
  given_name?: string | undefined;
  family_name?: string | undefined;
}

export interface AppMetadata {
  // TODO: Fix this type to be more specific
  /* eslint-disable-next-line */
  [propName: string]: any;
}

export interface UserMetadata {
  // TODO: Fix this type to be more specific
  /* eslint-disable-next-line */
  [propName: string]: any;
}

export interface Identity {
  connection: string;
  user_id: string;
  provider: string;
  isSocial: boolean;
  access_token?: string | undefined;
  profileData?:
    | {
        email?: string | undefined;
        email_verified?: boolean | undefined;
        name?: string | undefined;
        phone_number?: string | undefined;
        phone_verified?: boolean | undefined;
        request_language?: string | undefined;
      }
    | undefined;
}

// https://auth0.com/docs/actions/triggers/post-login/event-object
export interface Event<UserType extends User = User> {
  authentication?: EventAuthentication;
  authorization?: EventAuthorization;
  client: EventClient;
  connection: EventConnection;
  organization?: EventOrganization;
  request: EventRequest;
  resource_server?: EventResourceServer;
  stats: EventStats;
  tenant: EventTenant;
  transaction?: EventTransaction;
  user: UserType;
  secrets: EventSecrets;
}

export type AuthenticationMethodName =
  | 'federated'
  | 'pwd'
  | 'sms'
  | 'email'
  | 'mfa'
  | 'mock';

export interface AuthenticationMethod {
  name: AuthenticationMethodName;
  timestamp: string;
}

export interface EventAuthentication {
  methods: AuthenticationMethod[];
}

export interface EventAuthorization {
  roles: string[];
}

export interface EventClient {
  client_id: string;
  metadata: Record<string, string>;
  name: string;
}

export interface EventConnection {
  id: string;
  metadata?: Record<string, string>;
  name: string;
  strategy: string;
}

export interface EventOrganization {
  display_name: string;
  id: string;
  metadata: Record<string, string>;
  name: string;
}

export interface GeoIP {
  cityName?: string;
  continentCode?: string;
  countryCode?: string;
  countryCode3?: string;
  countryName?: string;
  latitude?: number;
  longitude?: number;
  timeZone?: string;
}

export interface EventRequest {
  body: Record<string, string>;
  geoip: GeoIP;
  hostname?: string;
  ip: string;
  language?: string;
  method: string;
  query: Record<string, string>;
  user_agent?: string;
}

export interface EventResourceServer {
  identifier: string;
}

export interface EventStats {
  logins_count: number;
}

export interface EventSecrets {
  IDENTITY_APP_BASEURL: string;
  AUTH0_PAYLOAD_SECRET: string;
  HASURA_TENANT_API_ENDPOINT: string;
  HASURA_ADMIN_SECRET: string;
  DEV_TENANT_ID?: string;
  DEV_CLOUD_TENANT_ID?: string;
  STAGING_TENANT_ID?: string;
}

export interface EventTenant {
  id: string;
}

export type EventTransactionProtocol =
  | 'oidc-basic-profile'
  | 'oidc-implicit-profile'
  | 'oauth2-device-code'
  | 'oauth2-resource-owner'
  | 'oauth2-resource-owner-jwt-bearer'
  | 'oauth2-password'
  | 'oauth2-access-token'
  | 'oauth2-refresh-token'
  | 'oauth2-token-exchange'
  | 'oidc-hybrid-profile'
  | 'samlp'
  | 'wsfed'
  | 'wstrust-usernamemixed';

export interface EventTransaction {
  acr_values: string[];
  locale: string;
  protocol?: EventTransactionProtocol;
  requested_scopes: string[];
  ui_locales: string[];
}

// https://auth0.com/docs/actions/triggers/post-login/api-object
export interface API<UserType extends User = User> {
  terms_and_conditions_accepted: boolean;
  access: APIAccess<UserType>;
  accessToken: APIAccessToken<UserType>;
  authentication: APIAuthentication<UserType>;
  idToken: APIIdToken<UserType>;
  multifactor: APIMultifactor<UserType>;
  user: APIUser<UserType>;
  redirect: APIRedirect<UserType>;
}

export interface APIAccess<UserType extends User = User> {
  deny: (reason: string) => API<UserType>;
}

export interface APIAccessToken<UserType extends User = User> {
  setCustomClaim: <T>(name: string, value: T) => API<UserType>;
}

export interface APIIdToken<UserType extends User = User> {
  setCustomClaim: <T>(name: string, value: T) => API<UserType>;
}

export interface APIRedirect<UserType extends User = User> {
  sendUserTo: <SendUserObject>(
    url: string,
    query: SendUserObject
  ) => API<UserType>;
  encodeToken: <T>(EncodedToken: T) => API<UserType>;
  validateToken: <T>(ValidateToken: T) => API<UserType>;
}

export interface EncodedTokenPayloadObject {
  email: string;
}

export interface SendUserObject {
  query: object;
}

export interface ValidateToken {
  secret: string;
  tokenParameterName: string;
}

export interface EncodedToken {
  secret: string;
  payload: EncodedTokenPayloadObject;
}

export type APIMultifactorProvider =
  | 'any'
  | 'duo'
  | 'google-authenticator'
  | 'guardian'
  | 'none';

export type APIMultifactorFactor =
  | 'otp'
  | 'recovery-code'
  | 'email'
  | 'push-notification'
  | 'phone'
  | 'webauthn-platform'
  | 'webauthn-roaming';

export interface APIMultifactorOptions {
  allowRememberBrowser?: boolean;
}

export interface APIAuthentication<UserType extends User = User> {
  challengeWith: ({ type }: { type: APIMultifactorFactor }) => API<UserType>;
}

export interface APIMultifactor<UserType extends User = User> {
  enable: (
    provider: APIMultifactorProvider,
    options?: APIMultifactorOptions
  ) => API<UserType>;
}

export interface APIUser<UserType extends User = User> {
  setUserMetadata: <T>(name: string, value: T) => API<UserType>;
  setAppMetadata: <T>(name: string, value: T) => API<UserType>;
}

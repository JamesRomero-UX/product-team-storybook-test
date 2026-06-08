import type { InferSelectModel } from '@risksmart-app/drizzle/src/db';

export type SsoConfigurationRow = InferSelectModel<'sso_configuration'>;

export type CreateSsoConfigurationResponse = SsoConfigurationRow;

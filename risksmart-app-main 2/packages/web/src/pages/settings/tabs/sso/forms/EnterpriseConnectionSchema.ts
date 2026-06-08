import { z } from 'zod';

const requiredMessage = 'Required';

export enum Strategy {
  Ad = 'ad',
  Azure = 'waad',
  Google = 'google-apps',
  Okta = 'okta',
}
const domainTransform = (val: string) => val.replace(/^https?:\/\/|\/.*$/g, '');

const baseConnectionSchema = z.object({
  Domain: z
    .string()
    .trim()
    .min(1, { message: requiredMessage })
    .transform(domainTransform),
  IdentityProviderDomains: z
    .string()
    .trim()
    .pipe(
      z.string().regex(/^([a-zA-Z0-9.-]+\s*,\s*)*[a-zA-Z0-9.-]+$|^$/, {
        message: 'Domains must be separated by commas only',
      })
    )
    .optional(),
  ClientId: z.string().min(1, { message: requiredMessage }).trim(),
  ClientSecret: z.string().min(1, { message: requiredMessage }).trim(),
});

export type BaseConnectionData = z.infer<typeof baseConnectionSchema>;

export const OktaConfigSchema = baseConnectionSchema.extend({
  Strategy: z.literal(Strategy.Okta),
});

export const WaadConfigSchema = baseConnectionSchema.extend({
  Strategy: z.literal(Strategy.Azure),
  UseCommonEndpoint: z.boolean().default(false),
});

export const GoogleWorkspaceConfigSchema = baseConnectionSchema.extend({
  Strategy: z.literal(Strategy.Google),
});

export const AdConfigSchema = baseConnectionSchema.extend({
  Strategy: z.literal(Strategy.Ad),
});

export const EnterpriseConnectionSchema = z.discriminatedUnion('Strategy', [
  OktaConfigSchema,
  WaadConfigSchema,
  GoogleWorkspaceConfigSchema,
  AdConfigSchema,
]);

export type EnterpriseConnectionFormData = z.infer<
  typeof EnterpriseConnectionSchema
>;
export type OktaConfigData = z.infer<typeof OktaConfigSchema>;
export type WaadConfigData = z.infer<typeof WaadConfigSchema>;
export type GoogleWorkspaceConfigData = z.infer<
  typeof GoogleWorkspaceConfigSchema
>;

export type AdConfigData = z.infer<typeof AdConfigSchema>;

const baseDefaultValues: BaseConnectionData = {
  Domain: '',
  ClientId: '',
  ClientSecret: '',
  IdentityProviderDomains: '',
};

export const oktaDefaultValues: OktaConfigData = {
  ...baseDefaultValues,
  Strategy: Strategy.Okta,
};

export const waadDefaultValues: WaadConfigData = {
  ...baseDefaultValues,
  Strategy: Strategy.Azure,
  UseCommonEndpoint: false,
};

export const googleWorkspaceDefaultValues: GoogleWorkspaceConfigData = {
  ...baseDefaultValues,
  Strategy: Strategy.Google,
};

export const adDefaultValues: AdConfigData = {
  ...baseDefaultValues,
  Strategy: Strategy.Ad,
};

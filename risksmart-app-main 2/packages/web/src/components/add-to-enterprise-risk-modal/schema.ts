import { z } from 'zod';

export const schema = ({
  currentEntityId,
  currentEnterpriseRiskId,
  errorMessage,
}: {
  currentEntityId: null | string | undefined;
  currentEnterpriseRiskId: null | string | undefined;
  errorMessage: string;
}) =>
  z
    .object({
      EntityId: z.string().uuid({ message: 'Entity is required' }),
      EnterpriseRiskId: z.string().nullish(),
    })
    .refine(
      (val) => {
        if (
          currentEntityId &&
          currentEnterpriseRiskId &&
          val.EntityId === currentEntityId &&
          val.EnterpriseRiskId === currentEnterpriseRiskId
        ) {
          return false;
        }

        return true;
      },
      {
        message: errorMessage,
        path: ['EnterpriseRiskId'],
      }
    );

export type SchemaFields = z.infer<ReturnType<typeof schema>>;

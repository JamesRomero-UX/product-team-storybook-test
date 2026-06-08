import type { FormId } from '@risksmart-app/shared/forms/formConfigRegistry';
import type {
  Change_Request_File_Operation_Enum,
  GetFormFieldOptionsByParentTypeQuery,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ReactNode } from 'react';
import type {
  DefaultValues,
  FieldValues,
  UseFormReturn,
} from 'react-hook-form';
import type { FileOrRelation } from 'src/schemas/global';
import type z from 'zod';

import type { ObjectWithApprovals } from '@/hooks/useChangeRequests';

export enum ButtonVariant {
  Danger = 'Danger',
  Normal = 'Normal',
  Primary = 'Primary',
  Standard = 'Standard',
}
export type SubmitButtonOptions = {
  variant?: ButtonVariant;
  label: string;
  action: () => Promise<void>;
  loading?: boolean;
  disableNotification?: boolean;
  disabled?: boolean;
};

export type CommonProps<TFieldValues extends FieldValues> = Omit<
  FormContextProps<TFieldValues>,
  'renderTemplate'
>;

export type FormTemplateProps<TFieldValues extends FieldValues> =
  FormContextProps<TFieldValues> & { actions: ReactNode };

export type SaveAction<T> = (data: T) => Promise<void>;

type FormFieldsHook<TFieldValues extends FieldValues> = (
  options: UseFormReturn<TFieldValues>
) => FormFields;

type FormField = {
  component: ReactNode;
  hidden?: boolean;
};

export type FormFieldOptions =
  GetFormFieldOptionsByParentTypeQuery['form_field_configuration'];

type FormFields = Record<string, FormField>;

export type SubmitButton<TFieldValues extends FieldValues> = Omit<
  SubmitButtonOptions,
  'action'
> & {
  action: SaveAction<TFieldValues>;
};

export type FormContextProps<TFieldValues extends FieldValues> = {
  testId?: string;
  formId: string;
  header?: ReactNode | string;
  defaultValues: DefaultValues<TFieldValues>;
  values?: TFieldValues;
  children?: ReactNode;
  fields?: FormFields | FormFieldsHook<TFieldValues>;
  onDismiss?: (saved: boolean) => void;
  onSave: SaveAction<TFieldValues>;
  onDelete?: () => Promise<void>;
  /**
   * Called when the change request is approved.
   */
  onDeleteApproved?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.Schema<any, any>;
  readOnly?: boolean;
  /**
   * The parent type of the form, used to determine the form field configuration
   */
  parentType?: FormId;
  /**
   * When specified, the form configuration for all possible parent types will be retrieved,
   * avoiding the loading state when switching types which causes the form to loose its state
   */
  possibleParentTypes?: Parent_Type_Enum[];
  aside?: ReactNode;
  renderTemplate: (props: FormTemplateProps<TFieldValues>) => ReactNode;
  submitActions?: SubmitButton<TFieldValues>[];
  secondaryActions?: SubmitButtonOptions[];
  approvalConfig?: {
    object?: ObjectWithApprovals;
  };
  i18n: {
    entity_name: string;
  };
  mapPreviewedChanges?: (
    a: TFieldValues | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    b: any,
    c: (FileOrRelation & {
      changeRequestFileOperation?: Change_Request_File_Operation_Enum;
    })[]
  ) => TFieldValues;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapRequestedChanges?: (requestedChanges: any) => any;
};

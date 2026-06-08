import { isApolloError, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { useTools } from '@risksmart-app/components/src/tools/useTools';
import { GetFileByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import axios from 'axios';
import _ from 'lodash';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type {
  DefaultValues,
  FieldValues,
  SubmitHandler,
} from 'react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { useCustomDatasourceHelpers } from 'src/pages/custom-datasources/useCustomDatasourceHelpers';
import { useFeatures } from 'src/rbac/useFeatures';
import type { ZodSchema } from 'zod';

import { useChangeRequests } from '@/hooks/useChangeRequests';
import { mutationResultNotification } from '@/hooks/useMutationResultNotification';
import { getErrorMessage, handleError } from '@/utils/errorUtils';

import { ChangeRequestAlerts } from './ChangeRequestAlerts';
import {
  buildFieldConditionGraph,
  getHiddenFields,
} from './conditional-fields-provider/conditionsGraph';
import { RiskSmartFormProvider } from './customisable-form/RiskSmartFormProvider';
import { useCustomisableFormDataContext } from './customisable-form-data/CustomisableFormDataContext';
import FormActions from './FormActions';
import { mapChanges } from './mapChanges';
import type { FormContextProps, SaveAction } from './types';

// It sets up methods and state for the form, and passes them down to the `ControlledForm` component
export const FormContext = <TFieldValues extends FieldValues>(
  props: FormContextProps<TFieldValues>
) => {
  const helpers = useCustomDatasourceHelpers();
  const { search } = useLocation();
  const {
    defaultValues: originalDefaultValues,
    values,
    schema,
    onSave,
    onDelete,
    readOnly,
    renderTemplate,
    submitActions,
    secondaryActions,
    mapPreviewedChanges,
    mapRequestedChanges,
    onDeleteApproved,
  } = props;
  const enabledFeatures = useFeatures();
  // TODO: eventually move this to a higher level
  const customisableFormData = useCustomisableFormDataContext();
  const { formFieldConfigurations } = customisableFormData;
  // could potentially move this into parent hook?
  const defaultValues = useMemo(
    () =>
      (formFieldConfigurations ?? []).reduce<DefaultValues<TFieldValues>>(
        (previous, currentValue) => {
          if (!_.isNil(currentValue.DefaultValue)) {
            _.set(previous, currentValue.FieldId, currentValue.DefaultValue);
          }

          return previous;
        },
        originalDefaultValues
      ),
    [originalDefaultValues, formFieldConfigurations]
  );

  const { t: st } = useTranslation('common');
  const [onSaveFn, setOnSave] = useState<(() => Promise<void>) | undefined>();
  const [beforeSaveHooks, setBeforeSaveHooks] = useState<
    (() => Promise<boolean>)[]
  >([]);

  const { addNotification } = useNotifications();
  const [viewingChangeRequest, setViewingChangeRequest] = useState(false);
  const [customFormValidation, setCustomFormValidation] = useState<
    (schema: ZodSchema) => ZodSchema
  >(() => (s: ZodSchema) => s);
  const [toolsContent, setToolsContent] = useTools();

  const methods = useForm<TFieldValues>({
    /* @ts-ignore  TS2589: Type instantiation is excessively deep and possibly infinite. */
    resolver: zodResolver(customFormValidation(schema)),
    defaultValues,
    values,
    shouldFocusError: true,
    mode: 'onChange',
  });

  const searchParams = new URLSearchParams(search);
  const showRequest = searchParams.get('showRequest') === 'true';
  const changeRequestId = searchParams.get('requestId');

  const {
    pendingChangeRequests,
    pendingDeleteRequests,
    canAmendChangeRequest,
    changeRequests,
  } = useChangeRequests(props.approvalConfig?.object);

  const hasBeenDeleted = changeRequests.find(
    (cr) => cr.ChangeRequestStatus === 'approved' && cr.Type === 'delete'
  )?.Id;
  useEffect(() => {
    if (hasBeenDeleted) {
      onDeleteApproved?.();
    }
  }, [hasBeenDeleted, onDeleteApproved]);

  const inFlightChangeApproval = !!(
    pendingChangeRequests.length > 0 && props.approvalConfig?.object
  );

  const inFlightDeleteApproval = !!(
    pendingDeleteRequests.length > 0 && props.approvalConfig?.object
  );

  const viewingHistoricalChangeRequest: boolean =
    // If we are viewing a change request
    !!changeRequestId &&
    // And it is not in the list of pending change or delete requests.
    !pendingChangeRequests.map((cr) => cr.Id).includes(changeRequestId) &&
    !pendingDeleteRequests.map((cr) => cr.Id).includes(changeRequestId);

  const changeRequest = inFlightChangeApproval
    ? pendingChangeRequests[0]
    : pendingDeleteRequests[0];

  const { data: documentVersionFile, loading: documentVersionFileLoading } =
    useQuery(GetFileByIdDocument, {
      variables: {
        Id: changeRequest?.RequestedChanges?.FileId,
      },
      skip: !changeRequest?.RequestedChanges?.FileId,
    });

  useEffect(() => {
    if (viewingChangeRequest) {
      if (viewingHistoricalChangeRequest) {
        setToolsContent(
          `change-request:${props.approvalConfig?.object?.Id}:${changeRequestId}`
        );

        return;
      }

      if (!changeRequest) {
        return;
      }

      // Update form values with requested changes
      methods.reset(
        mapPreviewedChanges?.(
          values,
          changeRequest.RequestedChanges,
          changeRequest.requestedFileChanges.map((file) => ({
            ContentType: file?.file?.ContentType || '',
            FileName: file?.file?.FileName || '',
            FileSize: file?.file?.FileSize || 0,
            Id: file?.file?.Id || '',
            CreatedAtTimestamp: file?.file?.CreatedAtTimestamp || '',
            changeRequestFileOperation:
              file.ChangeRequestFileOperation ?? undefined,
          }))
        ) ?? {
          ...values,
          ...changeRequest.RequestedChanges,
          files: [
            ...(values?.files && !documentVersionFile?.file_by_pk
              ? values.files
              : []),
            ...changeRequest.requestedFileChanges,
            ...(documentVersionFile?.file_by_pk && !documentVersionFileLoading
              ? [documentVersionFile.file_by_pk]
              : []),
          ],
        }
      );
      setToolsContent(
        `change-request:${props.approvalConfig?.object?.Id}:${changeRequest.Id}`
      );
    } else {
      if (inFlightChangeApproval) {
        methods.reset(values);
      }
      if (
        toolsContent?.startsWith('change-request') &&
        (pendingChangeRequests[0] || pendingDeleteRequests[0])
      ) {
        setToolsContent(undefined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    viewingChangeRequest,
    inFlightChangeApproval,
    documentVersionFile,
    documentVersionFileLoading,
    changeRequest,
  ]);

  useEffect(() => {
    if (!toolsContent?.startsWith('change-request')) {
      setViewingChangeRequest(false);
    }
  }, [toolsContent]);

  useEffect(() => {
    if (
      showRequest &&
      changeRequests.length > 0 &&
      props.approvalConfig?.object?.Id
    ) {
      setViewingChangeRequest(true);
      setToolsContent(
        changeRequestId
          ? `change-request:${props.approvalConfig?.object?.Id}:${changeRequestId}`
          : `change-request:${props.approvalConfig?.object?.Id}`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, pendingChangeRequests, changeRequests]);

  const entityName = props.i18n.entity_name;

  const onDismiss = (saved: boolean) => {
    methods.reset();
    props.onDismiss?.(saved);
  };

  const handleSubmitWrapper = ({
    action,
    disableNotification,
  }: {
    action: SaveAction<TFieldValues>;
    disableNotification?: boolean;
  }) => {
    const handler: SubmitHandler<TFieldValues> = async (data) => {
      const beforeSave = await Promise.all(
        beforeSaveHooks.map((hook) => hook())
      );

      if (beforeSave.some((result) => !result)) {
        return false;
      }

      return mutationResultNotification<TFieldValues>({
        disableNotification,
        addNotification,
        asyncAction: async (data) => {
          try {
            const fieldConditionGraph = buildFieldConditionGraph(
              customisableFormData.formFieldConfigurations ?? []
            );
            const hiddenFields = props.parentType
              ? getHiddenFields({
                  formId: props.parentType,
                  customisableData: customisableFormData,
                  fieldConditionGraph,
                  currentValues: data,
                  helpers,
                  enabledFeatures,
                })
              : new Set<string>();

            let cleanupData = _.cloneDeep(data);
            hiddenFields.forEach((fieldId) => {
              cleanupData = _.set(cleanupData, fieldId, null);
            });
            await action(cleanupData);
            methods.reset();
            onDismiss(true);

            return true;
          } catch (error) {
            const e = error as Error;

            if (
              (isApolloError(e) &&
                e.graphQLErrors.some((er) =>
                  er.message.includes(
                    'You need to create a change request to perform this action.'
                  )
                )) ||
              e.message.includes('attestation warning error')
            ) {
              // don't show error in form if its due to a change request
              return true;
            }

            handleError(e);
            if (axios.isAxiosError(e) && e.config?.url?.startsWith('/files')) {
              // @ts-ignore
              methods.setError('newFiles', {
                message: getErrorMessage(e) || 'Unable to upload files',
              });
            } else if (isApolloError(e)) {
              // @ts-ignore
              methods.setError('global', {
                message: e.message,
                type: e.graphQLErrors?.[0]?.extensions?.code as string,
              });
            }

            return false;
          }
        },
        entityName,
        successMessageKey: values
          ? 'update_success_message'
          : 'create_success_message',
      })(data);
    };

    return handler;
  };

  const defaultSubmitActions = [
    {
      label: st('save'),
      action: onSave,
      disableNotification: false,
    },
  ];

  const defaultOnSave = methods.handleSubmit(
    handleSubmitWrapper({ action: onSave })
  );

  const inFlightApprovalReadOnly =
    (!viewingChangeRequest && inFlightChangeApproval) ||
    (viewingChangeRequest &&
      pendingChangeRequests[0] &&
      !canAmendChangeRequest(pendingChangeRequests[0]));

  const formActions: ReactNode = (
    <FormActions
      readOnly={
        inFlightApprovalReadOnly || readOnly || viewingHistoricalChangeRequest
      }
      onDismiss={onDismiss}
      formId={props.formId}
      methods={methods}
      onDelete={onDelete}
      submitActions={(submitActions || defaultSubmitActions).map((sa) => ({
        ...sa,
        action: methods.handleSubmit(
          handleSubmitWrapper({
            action: sa.action,
            disableNotification: sa.disableNotification,
          })
        ),
      }))}
      secondaryActions={
        secondaryActions?.map((sa) => ({
          ...sa,
        })) || []
      }
    />
  );

  const body = (
    <div className={'flex-col flex gap-5'} data-testid={'form-context'}>
      <ChangeRequestAlerts
        inFlightChangeApproval={inFlightChangeApproval}
        viewingHistoricalChangeRequest={viewingHistoricalChangeRequest}
        viewingChangeRequest={viewingChangeRequest}
        onToggleView={() => setViewingChangeRequest((prev) => !prev)}
        entityName={entityName}
        inFlightApprovalReadOnly={inFlightApprovalReadOnly}
        inFlightDeleteApproval={inFlightDeleteApproval}
      />
      {props.children}
    </div>
  );

  const mappedRequestedChanges =
    mapRequestedChanges && pendingChangeRequests[0]?.RequestedChanges
      ? mapRequestedChanges(pendingChangeRequests[0]?.RequestedChanges)
      : pendingChangeRequests[0]?.RequestedChanges;

  return (
    <>
      <RiskSmartFormProvider
        parentType={props.parentType}
        setCustomFormValidation={setCustomFormValidation}
        onSave={onSaveFn}
        beforeSaveHooks={beforeSaveHooks}
        setOnSave={setOnSave}
        setBeforeSaveHooks={setBeforeSaveHooks}
        previewChanges={
          inFlightChangeApproval && viewingChangeRequest && !!values
            ? mapChanges(values, {
                ...mappedRequestedChanges,
                files: pendingChangeRequests[0]?.requestedFileChanges,
              })
            : null
        }
        readOnly={
          inFlightApprovalReadOnly || readOnly || viewingHistoricalChangeRequest
        }
        defaultOnSave={defaultOnSave}
      >
        <FormProvider {...methods}>
          {renderTemplate({ ...props, actions: formActions, children: body })}
        </FormProvider>
      </RiskSmartFormProvider>
    </>
  );
};

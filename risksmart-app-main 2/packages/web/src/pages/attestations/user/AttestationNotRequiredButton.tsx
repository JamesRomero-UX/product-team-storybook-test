import type { SelectProps } from '@risk-smart/themed-cloudscape-components';
import { Box, SpaceBetween } from '@risk-smart/themed-cloudscape-components';
import Modal from '@risk-smart/themed-cloudscape-components/modal';
import Multiselect from '@risk-smart/themed-cloudscape-components/multiselect';
import Button from '@risksmart-app/components/src/button/Button';
import { Delete } from '@untitled-ui/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormField } from 'src/components/form/form/FormField';
import Tokens from 'src/components/tokens';

export interface AttestationNotRequiredButtonProps {
  attestations: { id: string; name: string }[];
  loading: boolean;
  onSave: (attestationRecordIds: string[]) => Promise<void>;
  onDismiss?: () => void;
  disabled?: boolean;
}

const AttestationNotRequiredButton: React.FC<
  AttestationNotRequiredButtonProps
> = ({ attestations, loading, onSave, onDismiss, disabled }) => {
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'attestations',
  });

  const ALL_OPTION: { value: string; label: string } = useMemo(
    () => ({
      value: '-1',
      label: st('notRequiredModal.allAttestations'),
    }),
    [st]
  );

  const [options, setOptions] = useState<Readonly<SelectProps.Option[]>>([]);

  const handleSave = async () => {
    if (options.find((o) => o.value === ALL_OPTION.value)) {
      await onSave(attestations.map((a) => a.id));
    } else {
      const selectedIds = new Set(options.map((o) => o.value));
      await onSave(
        attestations.filter((a) => selectedIds.has(a.id)).map((a) => a.id)
      );
    }
    setOptions([]);
    setShowModal(false);
  };

  const handleOnDismiss = () => {
    setOptions([]);
    setShowModal(false);
    onDismiss?.();
  };

  const onChange = (newOptions: Readonly<SelectProps.Option[]>) => {
    const allOption = newOptions.find((opt) => opt.value === ALL_OPTION.value);

    const previousAllOption = options.find(
      (opt) => opt.value === ALL_OPTION.value
    );
    const attestationOptions = attestations.map((a) => a.id);

    // if "All" is selected, select every options
    if (allOption && !previousAllOption) {
      setOptions(defaultOptions);

      return;
    }

    // if "All" is deselected, deselect every options
    if (!allOption && previousAllOption) {
      setOptions([]);

      return;
    }

    // if all attestations are selected, select "All"
    const selectedAttestationIds = newOptions
      .filter((opt) => opt.value !== ALL_OPTION.value)
      .map((opt) => opt.value);

    const selectedIds = new Set(selectedAttestationIds);

    if (
      attestationOptions.length > 0 &&
      selectedIds.size === attestationOptions.length &&
      attestationOptions.every((id) => selectedIds.has(id))
    ) {
      setOptions([
        ALL_OPTION,
        ...newOptions.filter((opt) => opt.value !== ALL_OPTION.value),
      ]);

      return;
    }

    // if not all options are selected, deselect "All"
    if (
      allOption &&
      selectedAttestationIds.length < attestationOptions.length
    ) {
      setOptions(newOptions.filter((opt) => opt.value !== ALL_OPTION.value));

      return;
    }

    setOptions(newOptions);
  };

  const defaultOptions: {
    value: string;
    label: string;
  }[] = useMemo(() => {
    return [
      ALL_OPTION,
      ...attestations
        .map((attestation) => ({
          value: attestation.id,
          label: attestation.name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [attestations, ALL_OPTION]);

  const tokens = useMemo(() => {
    if (options.find((o) => o.value === ALL_OPTION.value)) {
      return [ALL_OPTION];
    }

    return options.map((o) => ({
      value: o.value!,
      label: o.label!,
    }));
  }, [options, ALL_OPTION]);

  const onRemoveOption = (valueToRemove: string) => {
    const newOptions = options.filter((opt) => opt.value !== valueToRemove);
    onChange(newOptions);
  };

  return (
    <>
      <Button
        iconSvg={
          <Delete viewBox={'0 0 24 24'} width={'100%'} height={'100%'} />
        }
        onClick={() => setShowModal(true)}
        disabled={disabled}
      >
        {st('notRequiredModal.buttonLabel')}
      </Button>

      <Modal
        onDismiss={handleOnDismiss}
        visible={showModal}
        closeAriaLabel={t('closeModal')}
        size={'large'}
        footer={
          <Box float={'left'}>
            <SpaceBetween direction={'horizontal'} size={'xs'}>
              <Button disabled={loading} onClick={handleSave}>
                {t('save')}
              </Button>
              <Button
                disabled={loading}
                variant={'normal'}
                onClick={handleOnDismiss}
              >
                {t('cancel')}
              </Button>
            </SpaceBetween>
          </Box>
        }
        header={st('notRequiredModal.title')}
      >
        <FormField label={st('notRequiredModal.label')} stretch>
          <Multiselect
            options={defaultOptions}
            selectedOptions={options}
            onChange={(e) => {
              onChange(e.detail.selectedOptions);
            }}
            placeholder={st('notRequiredModal.placeholder')}
            empty={t('noMatchedFound')}
            hideTokens
          />
          <Tokens onRemove={onRemoveOption} tokens={tokens} />
        </FormField>
      </Modal>
    </>
  );
};

export default AttestationNotRequiredButton;

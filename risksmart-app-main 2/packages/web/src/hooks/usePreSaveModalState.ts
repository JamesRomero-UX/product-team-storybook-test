import { useCallback, useEffect, useState } from 'react';
import { useRiskSmartForm } from 'src/components/form/form/customisable-form/RiskSmartFormContext';

export const usePreSaveModalState = (condition?: boolean) => {
  const [showModal, setShowModal] = useState(false);
  const { setBeforeSaveHooks, defaultOnSave } = useRiskSmartForm();

  const beforeSave = useCallback(async () => {
    if (!showModal && (condition ?? true)) {
      setShowModal(true);

      return false;
    }
    setShowModal(false);

    return true;
  }, [showModal, condition]);

  useEffect(() => {
    setBeforeSaveHooks((prev) => [...prev, beforeSave]);

    return () => {
      setBeforeSaveHooks((prev) => prev.filter((hook) => hook !== beforeSave));
    };
  }, [setBeforeSaveHooks, beforeSave]);

  const onDismiss = () => {
    setShowModal(false);
  };

  return { onDismiss, onConfirm: defaultOnSave, visible: showModal };
};

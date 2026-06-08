import { createContext, useContext } from 'react';

export const ConditionalFieldsContext = createContext<Set<string>>(new Set());

export const useConditionalFieldsContext = () => {
  const context = useContext(ConditionalFieldsContext);
  if (!context) {
    throw new Error(
      'useConditionalFieldsContext must be used within a ConditionalFieldsProvider'
    );
  }

  return context;
};

export const useIsConditionalFieldVisible = (fieldId: string) => {
  const context = useConditionalFieldsContext();

  return !context.has(fieldId);
};

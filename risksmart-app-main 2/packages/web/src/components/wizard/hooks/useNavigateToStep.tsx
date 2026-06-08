import { useTools } from '@risksmart-app/components/src/tools/useTools';
import { useNavigate } from 'react-router';

import { useWizardStore } from '../store/useWizardStore';

export const useNavigateToStep = () => {
  const { steps, setBasePath } = useWizardStore();
  const [_, setToolsContent] = useTools();

  const navigate = useNavigate();

  return {
    navigateToStep: (basePath: string, step: number) => {
      setToolsContent('wizard');
      setBasePath(basePath);
      navigate(`${basePath}/${steps[step]?.tab ?? ''}`);
    },
  };
};

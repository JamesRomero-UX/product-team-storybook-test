import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import type { FC } from 'react';
import { ModalWrapper } from 'src/components/form/form/ModalWrapper';
import type { IssueFormDataFields } from 'src/pages/issues/update/forms/issueSchema';

import IssueForm from './update/forms/IssueForm';

type Props = {
  onDismiss: () => void;
  onSaving: (action: IssueFormDataFields) => Promise<void>;
  issueType: ParentIssueType;
};

const IssueModal: FC<Props> = ({ onDismiss, onSaving, issueType }) => (
  <IssueForm
    onSave={onSaving}
    onDismiss={onDismiss}
    issueType={issueType}
    renderTemplate={(renderProps) => (
      <ModalWrapper {...renderProps} visible={true} />
    )}
  />
);

export default IssueModal;

import type { FC } from 'react';
import { ChangeRequestAlert } from 'src/components/change-requests-preview/ChangeRequestAlert';
import { DeleteRequestAlert } from 'src/components/change-requests-preview/DeleteRequestAlert';
import { HistoricalChangeRequestAlert } from 'src/components/change-requests-preview/HistoricalChangeRequestAlert';

export type Props = {
  inFlightChangeApproval: boolean;
  viewingHistoricalChangeRequest: boolean;
  viewingChangeRequest: boolean;
  onToggleView: () => void;
  entityName: string;
  inFlightDeleteApproval: boolean;
  inFlightApprovalReadOnly: boolean;
};

export const ChangeRequestAlerts: FC<Props> = ({
  inFlightChangeApproval,
  viewingHistoricalChangeRequest,
  viewingChangeRequest,
  onToggleView,
  entityName,
  inFlightApprovalReadOnly,
  inFlightDeleteApproval,
}) => {
  return (
    <>
      {inFlightChangeApproval && !viewingHistoricalChangeRequest && (
        <ChangeRequestAlert
          viewing={viewingChangeRequest}
          entityName={entityName}
          onToggleView={onToggleView}
          readOnly={inFlightApprovalReadOnly}
        />
      )}
      {inFlightDeleteApproval && !viewingHistoricalChangeRequest && (
        <DeleteRequestAlert
          viewing={viewingChangeRequest}
          entityName={entityName}
          onToggleView={onToggleView}
        />
      )}
      {viewingHistoricalChangeRequest && (
        <HistoricalChangeRequestAlert
          onToggleView={onToggleView}
          viewing={viewingChangeRequest}
        />
      )}
    </>
  );
};

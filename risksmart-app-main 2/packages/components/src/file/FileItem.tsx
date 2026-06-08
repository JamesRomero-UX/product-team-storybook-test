import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Box from '@risk-smart/themed-cloudscape-components/box';
import type { FC } from 'react';

import { humanFileSize } from './fileUtils';
import type { FileItemProps } from './types';

const FileItem: FC<FileItemProps> = ({
  fileId,
  onRemove,
  fileName,
  fileSize,
  file,
  error,
  disabled,
  downloadFile,
}) => {
  return (
    <Box margin={{ vertical: 'xs' }} key={fileId || file?.name}>
      <Alert
        type={error ? 'error' : 'success'}
        onDismiss={onRemove}
        dismissible={!disabled}
      >
        <div
          onClick={async () => {
            downloadFile({ fileId, fileName, file });
          }}
        >
          {fileName}
          <br />
          <Box variant={'small'}>{humanFileSize(fileSize)}</Box>
        </div>
      </Alert>
    </Box>
  );
};

export default FileItem;

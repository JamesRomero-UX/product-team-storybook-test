import 'json-diff-kit/dist/viewer.css';

import Grid from '@risk-smart/themed-cloudscape-components/grid';
import { Differ, Viewer } from 'json-diff-kit';

export type AuditViewComponentProps = {
  operation: 'Added' | 'Deleted' | 'Updated';
  current: string;
  previous: string;
};

const AuditViewComponent = (props: AuditViewComponentProps) => {
  const differ = new Differ({
    detectCircular: true,
    maxDepth: Infinity,
    showModifications: true,
    arrayDiffMethod: 'lcs',
  });

  return (
    <>
      <Grid gridDefinition={[{ colspan: 12 }]}>
        {props.current ? (
          <Viewer
            diff={differ.diff(
              JSON.parse(
                props.operation !== 'Deleted'
                  ? (props.previous ?? '{}')
                  : (props.current ?? '{}')
              ),
              JSON.parse(
                props.operation === 'Deleted' ? '{}' : (props.current ?? '{}')
              )
            )}
            indent={2}
            highlightInlineDiff={true}
            inlineDiffOptions={{
              mode: 'word',
              wordSeparator: ' ',
            }}
          />
        ) : (
          <></>
        )}
      </Grid>
    </>
  );
};

export default AuditViewComponent;

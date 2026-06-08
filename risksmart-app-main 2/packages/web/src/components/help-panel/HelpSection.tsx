import { getEnv } from '@risksmart-app/components/src/utils/environment';
import { Editor } from '@tinymce/tinymce-react';
import { type FC } from 'react';

type Props = {
  title?: string;
  htmlContent: string;
};

const HelpSection: FC<Props> = ({ title, htmlContent }) => {
  return (
    <>
      {title && <h3 data-testid={'help-section-heading'}>{title}</h3>}
      <div
        className={'help-section-html-viewer'}
        data-testid={'help-section-content'}
      >
        <Editor
          inline={true}
          initialValue={htmlContent ?? undefined}
          disabled={true}
          apiKey={getEnv('REACT_APP_TINY_API_KEY')}
          init={{
            content_style: `
   
    .help-section-html-viewer * {
      outline: none !important;
      border: none !important;
    }
    .help-section-html-viewer *:focus {
      outline: none !important;
      box-shadow: none !important;
      border: none !important;
    }
  `,
            setup: (editor) => {
              // ensure hyperlinks work
              editor.on('click', (e) => {
                const target = e.target as HTMLAnchorElement;
                if (target.tagName === 'A') {
                  window.open(target.href, '_blank');
                  e.preventDefault();
                }
              });
            },
          }}
        />
      </div>
    </>
  );
};

export default HelpSection;

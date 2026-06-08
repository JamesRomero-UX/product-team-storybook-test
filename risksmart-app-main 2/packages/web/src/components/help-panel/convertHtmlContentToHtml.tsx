import Linkify from 'linkify-react';
import ReactDOMServer from 'react-dom/server';

import type { Content } from './useHelpStore';

export function contentToHtml(content: Content): string {
  const html =
    typeof content === 'string' ? (
      content === '' ? (
        content
      ) : (
        renderContent(content)
      )
    ) : (
      <div>
        {content.map((c, index) => (
          <div key={index}>
            <h4>{c.title}</h4>
            {renderContent(c.content)}
          </div>
        ))}
      </div>
    );

  return ReactDOMServer.renderToStaticMarkup(html);
}

const renderContent = (content: string) => {
  return content.split('\n').map((line, lineIndex) => (
    <Linkify
      key={lineIndex}
      as={'p'}
      options={{
        target: '_blank',
      }}
    >
      {line}
    </Linkify>
  ));
};

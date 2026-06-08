import type { FC } from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import styles from './MarkdownMessage.module.scss';

interface MarkdownMessageProps {
  content: string;
  isUser: boolean;
}

export const MarkdownMessage: FC<MarkdownMessageProps> = ({
  content,
  isUser,
}) => {
  const components: Components = {
    // Customize heading styles
    h1: ({ children }) => <h1 className={styles.heading1}>{children}</h1>,
    h2: ({ children }) => <h2 className={styles.heading2}>{children}</h2>,
    h3: ({ children }) => <h3 className={styles.heading3}>{children}</h3>,
    h4: ({ children }) => <h4 className={styles.heading4}>{children}</h4>,
    h5: ({ children }) => <h5 className={styles.heading5}>{children}</h5>,
    h6: ({ children }) => <h6 className={styles.heading6}>{children}</h6>,

    // Customize paragraph styles
    p: ({ children }) => <p className={styles.paragraph}>{children}</p>,

    // Customize list styles
    ul: ({ children }) => <ul className={styles.unorderedList}>{children}</ul>,
    ol: ({ children }) => <ol className={styles.orderedList}>{children}</ol>,
    li: ({ children }) => <li className={styles.listItem}>{children}</li>,

    // Customize code styles
    code: ({ children, className }) => {
      const isInline = !className || !className.includes('language-');

      return isInline ? (
        <code className={styles.inlineCode}>{children}</code>
      ) : (
        <code className={styles.codeBlock}>{children}</code>
      );
    },
    pre: ({ children }) => <pre className={styles.preBlock}>{children}</pre>,

    // Customize blockquote styles
    blockquote: ({ children }) => (
      <blockquote className={styles.blockquote}>{children}</blockquote>
    ),

    // Customize link styles
    a: ({ href, children }) => (
      <a
        href={href}
        className={styles.link}
        target={'_blank'}
        rel={'noopener noreferrer'}
      >
        {children}
      </a>
    ),

    // Customize table styles
    table: ({ children }) => <table className={styles.table}>{children}</table>,
    thead: ({ children }) => (
      <thead className={styles.tableHead}>{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody className={styles.tableBody}>{children}</tbody>
    ),
    tr: ({ children }) => <tr className={styles.tableRow}>{children}</tr>,
    th: ({ children }) => <th className={styles.tableHeader}>{children}</th>,
    td: ({ children }) => <td className={styles.tableCell}>{children}</td>,

    // Customize horizontal rule
    hr: () => <hr className={styles.horizontalRule} />,
  };

  return (
    <div
      className={`${styles.markdownContainer} ${isUser ? styles.userMessage : styles.botMessage}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

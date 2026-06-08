import { Check } from '@untitled-ui/icons-react';
import clsx from 'clsx';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { EntityNode } from './EntityNode';
import { EntityTreeNode } from './EntityTreeNode';

interface EntityTreeListProps {
  nodes: EntityNode[];
  selectedId: string | undefined;
  initialExpandedIds?: string[];
  onSelect: (id: string | undefined) => void;
}

export const EntityTreeList: FC<EntityTreeListProps> = ({
  nodes,
  selectedId,
  initialExpandedIds = [],
  onSelect,
}) => {
  const { t } = useTranslation(['common']);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(initialExpandedIds),
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div
      className={'flex flex-col gap-1 p-3'}
      role={'listbox'}
      aria-label={t('entity.selectScope', 'Select entity scope')}
    >
      {/* Global / all entities option */}
      <button
        onClick={() => onSelect(undefined)}
        className={clsx(
          'flex items-center justify-between rounded-md w-full',
          'border-none hover:cursor-pointer bg-transparent hover:bg-navy_light',
          'text-left px-4 py-3 gap-3 text-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal',
        )}
        aria-pressed={selectedId === undefined}
      >
        <span
          className={clsx(
            selectedId === undefined ? 'text-teal font-bold' : 'text-white font-normal',
          )}
        >
          {t('entity.global', 'Global')}
        </span>
        <Check
          className={clsx(
            'w-5 h-5 shrink-0',
            selectedId === undefined ? 'text-teal' : 'text-transparent',
          )}
          aria-hidden
        />
      </button>

      {/* Divider between Global and entity tree */}
      <div
        className={'h-px bg-navy_light mx-1 my-0.5 opacity-50'}
        role={'separator'}
      />

      {/* Entity tree */}
      {nodes.map((node) => (
        <EntityTreeNode
          key={node.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          expandedIds={expandedIds}
          onSelect={onSelect}
          onToggleExpand={toggleExpand}
        />
      ))}
    </div>
  );
};

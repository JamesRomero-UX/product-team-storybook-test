import { Check, ChevronDown } from '@untitled-ui/icons-react';
import clsx from 'clsx';
import type { FC } from 'react';

import type { EntityNode } from './EntityNode';

export type EntityTreeNodeProps = {
  node: EntityNode;
  depth: number;
  selectedId: string | undefined;
  expandedIds: Set<string>;
  onSelect: (id: string | undefined) => void;
  onToggleExpand: (id: string) => void;
};

const countDescendants = (node: EntityNode): number => {
  if (!node.children?.length) return 0;
  return node.children.reduce(
    (acc, child) => acc + 1 + countDescendants(child),
    0,
  );
};

export const EntityTreeNode: FC<EntityTreeNodeProps> = ({
  node,
  depth,
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand,
}) => {
  const selected = selectedId === node.id;
  const expanded = expandedIds.has(node.id);
  const hasChildren = Boolean(node.children?.length);
  const descendantCount = countDescendants(node);
  const indentPx = depth * 16;

  return (
    <>
      {/* Row — div wrapper avoids nested-button HTML invalidity */}
      <div
        className={clsx('flex items-center w-full rounded-md transition-colors')}
        style={{ paddingLeft: `${12 + indentPx}px` }}
      >
        {/* Expand/collapse toggle — sibling to select button, not parent */}
        {hasChildren ? (
          <button
            onClick={() => onToggleExpand(node.id)}
            className={clsx(
              'flex items-center justify-center shrink-0 w-5 h-5',
              'bg-transparent border-none p-0 cursor-pointer rounded',
              'text-white opacity-40 hover:opacity-100 transition-opacity',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal',
            )}
            aria-label={expanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
            aria-expanded={expanded}
          >
            <ChevronDown
              className={clsx(
                'w-3.5 h-3.5 transition-transform duration-150',
                expanded ? 'rotate-0' : '-rotate-90',
              )}
            />
          </button>
        ) : (
          /* Spacer aligns leaf label with parent labels */
          <span className={'w-5 shrink-0'} aria-hidden />
        )}

        {/* Select button — takes remaining row width */}
        <button
          onClick={() => onSelect(node.id)}
          className={clsx(
            'flex flex-1 items-center justify-between',
            'border-none cursor-pointer bg-transparent',
            'text-left pl-2 pr-4 py-3 gap-3 text-sm',
            'transition-colors rounded-md hover:bg-navy_light',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal',
          )}
          aria-pressed={selected}
        >
          <div className={'flex items-center gap-1 min-w-0'}>
            <span
              className={clsx(
                'transition-colors truncate max-w-[184px]',
                selected ? 'text-teal font-bold' : 'text-white font-normal',
              )}
            >
              {node.name}
            </span>

            {/* Scope count — shown when a parent node is selected */}
            {selected && hasChildren && (
              <span
                className={'text-teal text-xs font-normal opacity-70 shrink-0'}
                aria-label={`Includes ${descendantCount} ${descendantCount === 1 ? 'entity' : 'entities'}`}
              >
                {`(${descendantCount} ${descendantCount === 1 ? 'entity' : 'entities'})`}
              </span>
            )}
          </div>

          <Check
            className={clsx(
              'w-5 h-5 shrink-0',
              selected ? 'text-teal' : 'text-transparent',
            )}
            aria-hidden
          />
        </button>
      </div>

      {/* Children rendered when expanded */}
      {hasChildren && expanded && (
        <div role={'group'} aria-label={`${node.name} sub-entities`}>
          {node.children!.map((child) => (
            <EntityTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </>
  );
};

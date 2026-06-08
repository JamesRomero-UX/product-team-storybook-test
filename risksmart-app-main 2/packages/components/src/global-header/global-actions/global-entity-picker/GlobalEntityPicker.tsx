import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useEntityFilter } from '../../../contexts/entityFilterContext';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { ChevronIcon } from '../user-menu/ChevronIcon';
import type { EntityNode } from './EntityNode';
import { GlobalEntityPickerPopup } from './GlobalEntityPickerPopup';

const findNodeInTree = (
  id: string | undefined,
  nodes: EntityNode[],
): EntityNode | null => {
  if (id === undefined) return null;
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeInTree(id, node.children);
      if (found) return found;
    }
  }
  return null;
};

interface Props {
  entityNodes?: EntityNode[];
}

export const GlobalEntityPicker: FC<Props> = ({ entityNodes = [] }) => {
  const { t } = useTranslation();
  const { entityIds } = useEntityFilter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentId = entityIds?.[0];
  const currentNode = findNodeInTree(currentId, entityNodes);
  const [selectedEntityLabel, setSelectedEntityLabel] = useState<
    string | undefined
  >(currentNode?.name);

  const containerRef = useClickOutside<HTMLDivElement>(
    () => setIsMenuOpen(false),
    isMenuOpen,
  );

  return (
    <div className={'flex items-center justify-end'} ref={containerRef}>
      <button
        className={
          'flex bg-transparent focus-visible:outline-none ' +
          'cursor-pointer transition opacity-80 hover:opacity-100 ' +
          'gap-2 border-none px-6'
        }
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={t('selectEntity')}
      >
        <div
          className={
            'flex text-teal text-sm font-bold gap-2 font-sans text-nowrap'
          }
        >
          <span>{selectedEntityLabel || t('entity.global')}</span>
          <ChevronIcon isMenuOpen={isMenuOpen} textColor={'text-teal'} />
        </div>
      </button>

      <div
        className={`fixed top-[53px] transition-all ${isMenuOpen ? 'h-full opacity-100' : 'h-0 opacity-0'} z-[949] overflow-hidden`}
      >
        <GlobalEntityPickerPopup
          onClose={() => setIsMenuOpen(false)}
          entityNodes={entityNodes}
          setSelectedEntityLabel={setSelectedEntityLabel}
        />
      </div>
    </div>
  );
};

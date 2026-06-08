// Prototype — RSP-5685: ERM Entity Hierarchy Picker
// REVISED: 2026-05-27 — post design-critique pass + production token alignment
//
// Brief: https://linear.app/risksmart/issue/RSP-5685
//
// Root cause: both AuthenticatedAppLayout.tsx and PageLayout.tsx contain:
//   .filter((entity) => !entity.children || !entity.children.length)
//   // @TODO: remove filter once support for nested entities is added
//
// The hierarchy data IS in the GraphQL response. It is stripped client-side
// before being passed to the picker. Fix = remove the filter + swap EntityList
// for EntityTreeList (reference implementation below).
//
// ── Critique fixes applied in this revision ───────────────────────────────
//
//  🔴 BLOCKER fixed: nested <button> inside <button> in EntityTreeNode.
//       Row is now a <div>; expand toggle and select are sibling buttons.
//
//  🟡 Merged EntityTreePicker + EntityTreePickerInteractive (dead-code hazard).
//       Single component with optional onSelectionChange callback.
//
//  🟡 Dead code removed: unused `picker` variable in ERMPage tree case.
//
//  🟡 Trigger label now shows scope count when parent selected:
//       "USA" → "USA (4)" — scope visible without opening the picker.
//
//  🟡 Auto-expand-to-selected: on mount, ancestors of initialSelectedId
//       are automatically added to expandedIds so the selected item is always
//       visible when the popup opens.
//
//  🟡 Added ErrorState story (entity query failure).
//
//  🟡 Production token alignment: py-3/px-4/gap-3/w-5 h-5/max-w-[184px] now
//       match EntityOption exactly (verified against source on 2026-05-27).
//
// ── Open (unchanged) ──────────────────────────────────────────────────────
//  — Max depth: prototype is unlimited. May need scroll-cap at 4+ levels.
//  — Multi-entity selection is out of scope for RSP-5685 (single-select).
//  — ARIA: aria-pressed on row buttons is acceptable for prototype review.
//    Production implementation should use role="tree"/role="treeitem"/aria-selected.
//    Tracked as an open question in _prototypes/RSP-5685/README.md.
//
// Stories:
//   1. Before           — current flat list (leaf-only, status quo)
//   2. TreeDefault      — tree open, nothing selected (Global)
//   3. LeafSelected     — single leaf entity selected
//   4. ParentSelected   — parent entity selected → "(2 entities)"
//   5. GrandparentSelected — top entity selected → "(4 entities)"
//   6. CollapsedBranch  — a subtree collapsed to show scale management
//   7. Loading          — entities loading
//   8. EmptyState       — no entities configured
//   9. ErrorState       — entity query failure
//
// Engineering changes required after sign-off (NOT in this file):
//   1. packages/web/src/layouts/AuthenticatedAppLayout.tsx
//      → remove .filter((entity) => !entity.children?.length) + @TODO comment
//      → update entityOptions type to EntityNode[] (hierarchical)
//   2. packages/web/src/layouts/PageLayout.tsx — same removal
//   3. packages/components/src/global-header/.../GlobalEntityPickerPopup.tsx
//      → replace EntityList + EntityOption with EntityTreeList + EntityTreeNode
//   4. Update entityOptions prop type through the full prop chain

import { useCollection } from '@cloudscape-design/collection-hooks';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import ContentLayout from '@risk-smart/themed-cloudscape-components/content-layout';
import Pagination from '@risk-smart/themed-cloudscape-components/pagination';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { Check, ChevronDown } from '@untitled-ui/icons-react';
// eslint-disable-next-line import/no-unresolved
import PageHeader from '@risksmart-app/components/src/page-header';
// eslint-disable-next-line import/no-unresolved
import { colours } from '@risksmart-app/components/src/utils/colours';
import clsx from 'clsx';

import '../cloudscape-reference/_setup';
import { PageLayout, RealProviders } from '../app-shell/Shell';
// eslint-disable-next-line import/no-unresolved
import Table from '@risksmart-app/components/src/table';
// eslint-disable-next-line import/no-unresolved
import PropertyFilterPanel from 'src/components/property-filter-panel';
// eslint-disable-next-line import/no-unresolved
import SimpleRatingBadge from 'src/components/simple-rating-badge';
// eslint-disable-next-line import/no-unresolved
import EmptyEntityCollection from 'src/components/empty-collection/EmptyEntityCollection';
// eslint-disable-next-line import/no-unresolved
import NoMatchesCollection from 'src/components/empty-collection/NoMatchesCollection';
// eslint-disable-next-line import/no-unresolved
import { DashboardItem } from 'src/components/register-dashboard/DashboardItem';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
// @ts-expect-error — resolved at runtime via vite.config.ts alias
import { AuthenticatedAppLayout } from '../app-shell/_stubs/AuthenticatedAppLayout';
// @ts-expect-error — resolved at runtime via vite.config.ts alias
import { GlobalHeader } from '@risksmart-app/components/src/global-header/GlobalHeader';
// @ts-expect-error — resolved at runtime via vite.config.ts alias
import { SystemActions } from '@risksmart-app/components/src/global-header/global-actions/SystemActions';
// @ts-expect-error — resolved at runtime via vite.config.ts alias
import { UserMenu } from '@risksmart-app/components/src/global-header/global-actions/user-menu/UserMenu';

// ─── Data model ──────────────────────────────────────────────────────────────

type EntityNode = {
  id: string;
  name: string;
  children?: EntityNode[];
};

// ─── Sample data ─────────────────────────────────────────────────────────────
//
// 3-level hierarchy. Mirrors a realistic org (Mount Street / C. Hoares use case).

const HIERARCHY_3_LEVEL: EntityNode[] = [
  {
    id: 'usa',
    name: 'USA',
    children: [
      {
        id: 'northeast',
        name: 'Northeast',
        children: [
          { id: 'ny', name: 'New York' },
          { id: 'nj', name: 'New Jersey' },
        ],
      },
      { id: 'tx', name: 'Texas' },
    ],
  },
  {
    id: 'uk',
    name: 'UK',
    children: [
      { id: 'lon', name: 'London' },
      { id: 'man', name: 'Manchester' },
    ],
  },
  { id: 'au', name: 'Australia' },
];

// Flat leaf-only list — the CURRENT state (Before story)
const FLAT_LEAF_ONLY = [
  { id: 'ny', name: 'New York' },
  { id: 'nj', name: 'New Jersey' },
  { id: 'tx', name: 'Texas' },
  { id: 'lon', name: 'London' },
  { id: 'man', name: 'Manchester' },
  { id: 'au', name: 'Australia' },
];

// ─── Tree helpers ─────────────────────────────────────────────────────────────

const countDescendants = (node: EntityNode): number => {
  if (!node.children?.length) return 0;
  return node.children.reduce(
    (acc, child) => acc + 1 + countDescendants(child),
    0
  );
};

const isLeaf = (node: EntityNode) => !node.children?.length;

// Find a node by id anywhere in the tree. Returns null if not found.
const findNode = (id: string, nodes: EntityNode[]): EntityNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(id, node.children);
      if (found) return found;
    }
  }
  return null;
};

// Find the label for an id (traverses the full tree).
const findLabel = (id: string | undefined, nodes: EntityNode[]): string => {
  if (id === undefined) return 'Global';
  const node = findNode(id, nodes);
  return node?.name ?? id;
};

// Compute ancestor ids on the path from root → target id.
// Used to auto-expand ancestors of the selected node on popup open.
const findAncestorIds = (
  targetId: string,
  nodes: EntityNode[],
  ancestors: string[] = []
): string[] | null => {
  for (const node of nodes) {
    if (node.id === targetId) return ancestors;
    if (node.children) {
      const found = findAncestorIds(targetId, node.children, [
        ...ancestors,
        node.id,
      ]);
      if (found !== null) return found;
    }
  }
  return null;
};

// ─── EntityTreeNode ───────────────────────────────────────────────────────────
//
// Replaces EntityOption.
//
// STRUCTURE (post-critique fix):
//   <div> — row wrapper (handles indent, hover bg)
//     <button> — expand/collapse toggle (non-leaf only) — sibling, NOT parent
//     <button> — select action — takes flex-1
//       name + scope count
//       Check icon
//     <span> — leaf spacer (aligns text with child items)
//
// The nested-button bug from v1 is fixed here: expand and select are
// sibling buttons inside a div, not nested interactive elements.

type EntityTreeNodeProps = {
  node: EntityNode;
  depth: number;
  selectedId: string | undefined;
  expandedIds: Set<string>;
  onSelect: (id: string | undefined) => void;
  onToggleExpand: (id: string) => void;
};

const EntityTreeNode = ({
  node,
  depth,
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand,
}: EntityTreeNodeProps) => {
  const selected = selectedId === node.id;
  const expanded = expandedIds.has(node.id);
  const hasChildren = !isLeaf(node);
  const descendantCount = countDescendants(node);
  const indentPx = depth * 16;

  return (
    <>
      {/* Row — div container, not a button (avoids nested-button invalidity) */}
      <div
        className={clsx(
          'flex items-center w-full rounded-md',
          'transition-colors group'
        )}
        style={{ paddingLeft: `${12 + indentPx}px` }}
      >
        {/* ── Expand/collapse toggle (sibling to select button) ── */}
        {hasChildren ? (
          <button
            onClick={() => onToggleExpand(node.id)}
            className={clsx(
              'flex items-center justify-center shrink-0 w-5 h-5',
              'bg-transparent border-none p-0 cursor-pointer rounded',
              'text-white opacity-40 hover:opacity-100 transition-opacity',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal'
            )}
            aria-label={
              expanded ? `Collapse ${node.name}` : `Expand ${node.name}`
            }
            aria-expanded={expanded}
          >
            <ChevronDown
              className={clsx(
                'w-3.5 h-3.5 transition-transform duration-150',
                expanded ? 'rotate-0' : '-rotate-90'
              )}
            />
          </button>
        ) : (
          // Spacer: aligns leaf text with parent text (offset for chevron width)
          <span className={'w-5 shrink-0'} aria-hidden />
        )}

        {/* ── Select button — takes remaining width ── */}
        <button
          onClick={() => onSelect(node.id)}
          className={clsx(
            'flex flex-1 items-center justify-between',
            'border-none cursor-pointer bg-transparent',
            'text-left pl-2 pr-4 py-3 gap-3 text-sm',
            'transition-colors rounded-md',
            'hover:bg-navy_light',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal'
          )}
          aria-pressed={selected}
        >
          {/* Left: name + scope count when parent is selected */}
          <div className={'flex items-center gap-1 min-w-0'}>
            <span
              className={clsx(
                'transition-colors truncate max-w-[184px]',
                selected ? 'text-teal font-bold' : 'text-white font-normal'
              )}
            >
              {node.name}
            </span>

            {selected && hasChildren && (
              <span
                className={'text-teal text-xs font-normal opacity-70 shrink-0'}
                aria-label={`Includes ${descendantCount} ${descendantCount === 1 ? 'entity' : 'entities'}`}
              >
                ({descendantCount}{' '}
                {descendantCount === 1 ? 'entity' : 'entities'})
              </span>
            )}
          </div>

          {/* Right: check mark */}
          <Check
            className={clsx(
              'w-5 h-5 shrink-0',
              selected ? 'text-teal' : 'text-transparent'
            )}
            aria-hidden
          />
        </button>
      </div>

      {/* Children — rendered when expanded */}
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

// ─── EntityTreeList ───────────────────────────────────────────────────────────
//
// Replaces EntityList. Manages expand/collapse state.
// "Global" option is always first.

type EntityTreeListProps = {
  nodes: EntityNode[];
  selectedId: string | undefined;
  initialExpandedIds?: string[];
  onSelect: (id: string | undefined) => void;
};

const EntityTreeList = ({
  nodes,
  selectedId,
  initialExpandedIds = [],
  onSelect,
}: EntityTreeListProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(initialExpandedIds)
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
      aria-label={'Select entity scope'}
    >
      {/* Global / all entities option */}
      <button
        onClick={() => onSelect(undefined)}
        className={clsx(
          'flex items-center justify-between rounded-md w-full',
          'border-none hover:cursor-pointer bg-transparent hover:bg-navy_light',
          'text-left px-4 py-3 gap-3 text-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal'
        )}
        aria-pressed={selectedId === undefined}
      >
        <span
          className={clsx(
            selectedId === undefined
              ? 'text-teal font-bold'
              : 'text-white font-normal'
          )}
        >
          {'Global'}
        </span>
        <Check
          className={clsx(
            'w-5 h-5 shrink-0',
            selectedId === undefined ? 'text-teal' : 'text-transparent'
          )}
          aria-hidden
        />
      </button>

      {/* Divider */}
      <div
        className={'h-px bg-navy_light mx-1 my-0.5 opacity-50'}
        role={'separator'}
      />

      {/* Tree nodes */}
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

// ─── EntityTreePickerPopup ─────────────────────────────────────────────────────
//
// Replaces GlobalEntityPickerPopup.
// Same bg-navy_mid / shadow-lg / rounded-b-md styling as PopupContainer.
// Handles loading, empty, and error states.

type EntityTreePickerPopupProps = {
  nodes: EntityNode[];
  selectedId: string | undefined;
  initialExpandedIds?: string[];
  onSelect: (id: string | undefined) => void;
  loading?: boolean;
  empty?: boolean;
  error?: boolean;
};

const EntityTreePickerPopup = ({
  nodes,
  selectedId,
  initialExpandedIds,
  onSelect,
  loading = false,
  empty = false,
  error = false,
}: EntityTreePickerPopupProps) => (
  <div
    className={
      'bg-navy_mid text-white shadow-lg flex flex-col rounded-b-md font-sans min-w-[240px]'
    }
  >
    {loading ? (
      <div className={'flex items-center justify-center py-8 px-6 gap-3'}>
        <svg
          className={'animate-spin w-4 h-4 text-teal'}
          fill={'none'}
          viewBox={'0 0 24 24'}
          aria-label={'Loading entities'}
        >
          <circle
            className={'opacity-25'}
            cx={'12'}
            cy={'12'}
            r={'10'}
            stroke={'currentColor'}
            strokeWidth={'4'}
          />
          <path
            className={'opacity-75'}
            fill={'currentColor'}
            d={'M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z'}
          />
        </svg>
        <span className={'text-white text-sm opacity-60'}>
          {'Loading entities…'}
        </span>
      </div>
    ) : error ? (
      <div className={'py-8 px-6 text-center'}>
        <p className={'text-white text-sm opacity-70 m-0'}>
          {'Failed to load entities.'}
        </p>
        <p className={'text-white text-xs opacity-40 mt-1 m-0'}>
          {'Refresh the page or contact your administrator.'}
        </p>
      </div>
    ) : empty ? (
      <div className={'py-8 px-6 text-center'}>
        <p className={'text-white text-sm opacity-50 m-0'}>
          {'No entities configured.'}
        </p>
        <p className={'text-white text-xs opacity-30 mt-1 m-0'}>
          {'Contact your administrator to set up the entity hierarchy.'}
        </p>
      </div>
    ) : (
      <EntityTreeList
        nodes={nodes}
        selectedId={selectedId}
        initialExpandedIds={initialExpandedIds}
        onSelect={onSelect}
      />
    )}
  </div>
);

// ─── EntityTreePicker ─────────────────────────────────────────────────────────
//
// Full picker: trigger button + dropdown popup.
// Replaces GlobalEntityPicker + GlobalEntityPickerPopup together.
//
// REVISION: merged EntityTreePicker + EntityTreePickerInteractive into one.
//   Pass onSelectionChange to expose selection to a parent component.
//   If omitted, the picker manages selection internally only.
//
// REVISION: trigger label shows "(N)" count when a parent node is selected.
//   e.g. "Global" → "USA (4)" → "New York" — scope visible without opening picker.
//
// REVISION: auto-expand-to-selected — on mount, ancestors of initialSelectedId
//   are automatically added to initialExpandedIds so the item is always visible.

type EntityTreePickerProps = {
  nodes: EntityNode[];
  initialSelectedId?: string | undefined;
  initialExpandedIds?: string[];
  popupForceOpen?: boolean;
  loading?: boolean;
  empty?: boolean;
  error?: boolean;
  onSelectionChange?: (id: string | undefined) => void;
};

const EntityTreePicker = ({
  nodes,
  initialSelectedId = undefined,
  initialExpandedIds = [],
  popupForceOpen = false,
  loading = false,
  empty = false,
  error = false,
  onSelectionChange,
}: EntityTreePickerProps) => {
  const [isOpen, setIsOpen] = useState(popupForceOpen);
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialSelectedId
  );

  // Auto-expand the path to the initial selection so the selected item is
  // visible without the user manually expanding ancestors.
  const autoExpanded =
    initialSelectedId !== undefined
      ? (findAncestorIds(initialSelectedId, nodes) ?? [])
      : [];
  const resolvedExpandedIds = [
    ...new Set([...initialExpandedIds, ...autoExpanded]),
  ];

  const handleSelect = (id: string | undefined) => {
    setSelectedId(id);
    onSelectionChange?.(id);
    if (!popupForceOpen) setIsOpen(false);
  };

  // Trigger label: "Global" | "New York" | "USA (4)"
  const selectedNode = selectedId ? findNode(selectedId, nodes) : null;
  const triggerLabel = findLabel(selectedId, nodes);
  const triggerCount =
    selectedNode && !isLeaf(selectedNode)
      ? countDescendants(selectedNode)
      : null;

  return (
    <div className={'relative'}>
      {/* Trigger — lifted verbatim from GlobalEntityPicker */}
      <button
        className={
          'flex bg-transparent focus-visible:outline-none ' +
          'cursor-pointer transition opacity-80 hover:opacity-100 ' +
          'gap-2 border-none px-6'
        }
        onClick={() => setIsOpen((v) => !v)}
        aria-label={'Select entity scope'}
        aria-expanded={isOpen}
        aria-haspopup={'listbox'}
      >
        <div
          className={
            'flex text-teal text-sm font-bold gap-1.5 font-sans text-nowrap items-center'
          }
        >
          <span>{triggerLabel}</span>
          {/* Scope count — only when a non-leaf parent is selected */}
          {triggerCount !== null && (
            <span className={'text-teal text-xs font-normal opacity-70'}>
              ({triggerCount})
            </span>
          )}
          <ChevronDown
            className={clsx(
              'w-5 h-5 transition-transform duration-200 ease-out',
              isOpen ? 'rotate-180' : 'rotate-0'
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className={'absolute right-0 top-full z-[949]'}>
          <EntityTreePickerPopup
            nodes={nodes}
            selectedId={selectedId}
            initialExpandedIds={resolvedExpandedIds}
            onSelect={handleSelect}
            loading={loading}
            empty={empty}
            error={error}
          />
        </div>
      )}
    </div>
  );
};

// ─── FlatEntityPicker (Before state) ──────────────────────────────────────────
//
// The CURRENT production UI — flat list of leaf-only entities.
// Unchanged from v1.

type FlatEntityPickerProps = {
  options: typeof FLAT_LEAF_ONLY;
  popupForceOpen?: boolean;
};

const FlatEntityPicker = ({
  options,
  popupForceOpen = false,
}: FlatEntityPickerProps) => {
  const [isOpen, setIsOpen] = useState(popupForceOpen);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const selectedLabel =
    options.find((o) => o.id === selectedId)?.name ?? 'Global';

  return (
    <div className={'relative'}>
      <button
        className={
          'flex bg-transparent focus-visible:outline-none ' +
          'cursor-pointer transition opacity-80 hover:opacity-100 ' +
          'gap-2 border-none px-6'
        }
        onClick={() => setIsOpen((v) => !v)}
      >
        <div
          className={
            'flex text-teal text-sm font-bold gap-2 font-sans text-nowrap items-center'
          }
        >
          <span>{selectedLabel}</span>
          <ChevronDown
            className={clsx(
              'w-5 h-5 transition-transform duration-200 ease-out',
              isOpen ? 'rotate-180' : 'rotate-0'
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className={'absolute right-0 top-full z-[949]'}>
          <div
            className={
              'bg-navy_mid text-white shadow-lg flex flex-col rounded-b-md font-sans min-w-[200px]'
            }
          >
            <div className={'flex flex-col gap-1 p-3'}>
              <button
                onClick={() => {
                  setSelectedId(undefined);
                  setIsOpen(false);
                }}
                className={clsx(
                  'flex items-center justify-between rounded-md w-full',
                  'border-none hover:cursor-pointer bg-transparent hover:bg-navy_light',
                  'text-left px-4 py-3 gap-3 text-sm transition-colors whitespace-nowrap'
                )}
              >
                <span
                  className={
                    selectedId === undefined
                      ? 'text-teal font-bold'
                      : 'text-white font-normal'
                  }
                >
                  {'Global'}
                </span>
                <Check
                  className={clsx(
                    'w-5 h-5',
                    selectedId === undefined ? 'text-teal' : 'text-transparent'
                  )}
                />
              </button>

              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedId(opt.id);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    'flex items-center justify-between rounded-md w-full',
                    'border-none hover:cursor-pointer bg-transparent hover:bg-navy_light',
                    'text-left px-4 py-3 gap-3 text-sm transition-colors whitespace-nowrap'
                  )}
                >
                  <span
                    className={
                      selectedId === opt.id
                        ? 'text-teal font-bold'
                        : 'text-white font-normal'
                    }
                  >
                    {opt.name}
                  </span>
                  <Check
                    className={clsx(
                      'w-5 h-5',
                      selectedId === opt.id ? 'text-teal' : 'text-transparent'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── ERM register data ────────────────────────────────────────────────────────
//
// Mirrors the field shape from packages/web/src/pages/enterprise-risk/config.tsx.
// Colour keys match the production palette in
// packages/components/src/utils/colours.ts — these are semantic names, not hex.

type ERMRisk = {
  Id: string;
  SequentialIdLabelled: string;
  Title: string;
  ParentTitle: string | null;
  TierLabelled: string;
  entityId: string;
  InherentMeanLabelled: { color: string; label: string };
  ResidualMeanLabelled: { color: string; label: string };
};

const ALL_RISKS: ERMRisk[] = [
  {
    Id: 'er-001',
    SequentialIdLabelled: 'ER-001',
    Title: 'Regulatory capital breach',
    ParentTitle: null,
    TierLabelled: 'Tier 1',
    entityId: 'ny',
    InherentMeanLabelled: { color: 'light-red', label: 'High' },
    ResidualMeanLabelled: { color: 'light-red', label: 'High' },
  },
  {
    Id: 'er-002',
    SequentialIdLabelled: 'ER-002',
    Title: 'FX rate exposure',
    ParentTitle: null,
    TierLabelled: 'Tier 2',
    entityId: 'nj',
    InherentMeanLabelled: { color: 'orange', label: 'Medium' },
    ResidualMeanLabelled: { color: 'light-green', label: 'Low' },
  },
  {
    Id: 'er-003',
    SequentialIdLabelled: 'ER-003',
    Title: 'Cybersecurity incident',
    ParentTitle: null,
    TierLabelled: 'Tier 1',
    entityId: 'tx',
    InherentMeanLabelled: { color: 'dark-red', label: 'Critical' },
    ResidualMeanLabelled: { color: 'light-red', label: 'High' },
  },
  {
    Id: 'er-004',
    SequentialIdLabelled: 'ER-004',
    Title: 'Sanctions screening failure',
    ParentTitle: null,
    TierLabelled: 'Tier 1',
    entityId: 'lon',
    InherentMeanLabelled: { color: 'light-red', label: 'High' },
    ResidualMeanLabelled: { color: 'orange', label: 'Medium' },
  },
  {
    Id: 'er-005',
    SequentialIdLabelled: 'ER-005',
    Title: 'GDPR data breach',
    ParentTitle: null,
    TierLabelled: 'Tier 2',
    entityId: 'man',
    InherentMeanLabelled: { color: 'orange', label: 'Medium' },
    ResidualMeanLabelled: { color: 'light-green', label: 'Low' },
  },
  {
    Id: 'er-006',
    SequentialIdLabelled: 'ER-006',
    Title: 'Liquidity mismatch',
    ParentTitle: null,
    TierLabelled: 'Tier 1',
    entityId: 'au',
    InherentMeanLabelled: { color: 'light-green', label: 'Low' },
    ResidualMeanLabelled: { color: 'darker-green', label: 'Very low' },
  },
];

// Entity scope map: selected picker ID → entity IDs whose risks to include.
// Mirrors how useEntityWhereFilter uses _in: entityIds after RSP-5685 fix.
const ENTITY_SCOPE: Record<string, string[]> = {
  ny:        ['ny'],
  nj:        ['nj'],
  tx:        ['tx'],
  lon:       ['lon'],
  man:       ['man'],
  au:        ['au'],
  northeast: ['ny', 'nj'],
  usa:       ['ny', 'nj', 'tx'],
  uk:        ['lon', 'man'],
};

const getVisibleRisks = (selectedId: string | undefined): ERMRisk[] => {
  if (!selectedId) return ALL_RISKS;
  const scope = ENTITY_SCOPE[selectedId] ?? [selectedId];
  return ALL_RISKS.filter((r) => scope.includes(r.entityId));
};

// ─── ERM register column definitions ─────────────────────────────────────────
//
// Matches the columns from packages/web/src/pages/enterprise-risk/config.tsx.
// Uses the same production components as TablePage.stories.tsx.

const FILTERING_PROPERTIES = [
  {
    propertyLabel: 'ID',
    key: 'SequentialIdLabelled',
    groupValuesLabel: 'IDs',
    operators: ['=', '!='] as Array<'=' | '!='>,
  },
  {
    propertyLabel: 'Title',
    key: 'Title',
    groupValuesLabel: 'Titles',
    operators: [':', '!:', '=', '!='] as Array<':' | '!:' | '=' | '!='>,
  },
  {
    propertyLabel: 'Tier',
    key: 'TierLabelled',
    groupValuesLabel: 'Tiers',
    operators: ['=', '!='] as Array<'=' | '!='>,
  },
];

const COLUMNS = [
  {
    id: 'SequentialIdLabelled',
    header: 'ID',
    cell: (item: ERMRisk) => item.SequentialIdLabelled,
    width: 90,
  },
  {
    id: 'Title',
    header: 'Title',
    sortingField: 'Title',
    cell: (item: ERMRisk) => item.Title,
    isRowHeader: true,
    minWidth: 280,
  },
  {
    id: 'ParentTitle',
    header: 'Parent enterprise risk',
    cell: (item: ERMRisk) => item.ParentTitle ?? '—',
    minWidth: 160,
  },
  {
    id: 'TierLabelled',
    header: 'Tier',
    sortingField: 'TierLabelled',
    cell: (item: ERMRisk) => item.TierLabelled,
    minWidth: 90,
  },
  {
    id: 'InherentMeanLabelled',
    header: 'Inherent rating',
    cell: (item: ERMRisk) => (
      <SimpleRatingBadge rating={item.InherentMeanLabelled} />
    ),
    minWidth: 130,
  },
  {
    id: 'ResidualMeanLabelled',
    header: 'Residual rating',
    cell: (item: ERMRisk) => (
      <SimpleRatingBadge rating={item.ResidualMeanLabelled} />
    ),
    minWidth: 130,
  },
];

// ─── RibbonRow ───────────────────────────────────────────────────────────────
//
// Mirrors CustomisableRibbon chrome from TablePage.stories.tsx.
// Container styling matches customisable-ribbon/CustomisableRibbon.tsx (lines 186-220).

type RibbonItem = { id: string; title: string; value: number };

const RibbonRow = ({
  items,
  activeId = 'all',
  onClick,
}: {
  items: RibbonItem[];
  activeId?: string;
  onClick?: (id: string) => void;
}) => (
  <div
    className={
      'flex gap-6 flex-grow overflow-x-auto rounded-md border border-solid border-grey200 bg-white px-6 py-5'
    }
  >
    {items.map((item, idx) => (
      <div key={item.id} className={'flex flex-1 justify-between'}>
        <DashboardItem
          title={item.title}
          value={item.value}
          selected={item.id === activeId}
          onClick={() => onClick?.(item.id)}
        />
        {idx !== items.length - 1 ? (
          <div className={'w-1 h-full bg-grey200'} />
        ) : null}
      </div>
    ))}
  </div>
);

// ─── ERMRegister ──────────────────────────────────────────────────────────────
//
// Mirrors the production ERM register layout from Page.tsx:
//   CustomisableRibbon (Tier 1 / Tier 2 / Tier 3 / All risks) → Table
//
// Uses the same production components as TablePage.stories.tsx.
// The scope banner (Alert) is shown here when a non-global entity is selected,
// so the register is self-contained.

const ERMRegister = ({ selectedId }: { selectedId: string | undefined }) => {
  const allScopeItems = getVisibleRisks(selectedId);
  const [activeTierId, setActiveTierId] = useState<string>('all');

  // Ribbon items — counts update when entity scope changes
  const ribbonItems: RibbonItem[] = [
    { id: 'all',    title: 'All risks', value: allScopeItems.length },
    { id: 'Tier 1', title: 'Tier 1',   value: allScopeItems.filter((r) => r.TierLabelled === 'Tier 1').length },
    { id: 'Tier 2', title: 'Tier 2',   value: allScopeItems.filter((r) => r.TierLabelled === 'Tier 2').length },
    { id: 'Tier 3', title: 'Tier 3',   value: allScopeItems.filter((r) => r.TierLabelled === 'Tier 3').length },
  ];

  const rawItems =
    activeTierId === 'all'
      ? allScopeItems
      : allScopeItems.filter((r) => r.TierLabelled === activeTierId);

  const { items, propertyFilterProps, paginationProps, collectionProps } =
    useCollection(rawItems, {
      propertyFiltering: { filteringProperties: FILTERING_PROPERTIES },
      pagination: { pageSize: 10 },
      sorting: {},
    });

  // Scope banner content (prototype-only — shows filtering effect of entity selection)
  const scopeBanner = selectedId
    ? (() => {
        const scope = ENTITY_SCOPE[selectedId] ?? [selectedId];
        const entityLabel = findLabel(selectedId, HIERARCHY_3_LEVEL);
        const combined =
          scope.length > 1 ? ` (${scope.length} entities combined)` : '';
        return (
          <Alert type={'info'}>
            {'Showing risks for '}
            <strong>{entityLabel}</strong>
            {combined}
            {' — entity filter applied via the picker in the top bar.'}
          </Alert>
        );
      })()
    : null;

  return (
    <SpaceBetween size={'l'}>
      {scopeBanner}
      <RibbonRow
        items={ribbonItems}
        activeId={activeTierId}
        onClick={setActiveTierId}
      />
      <Table
        {...collectionProps}
        columnDefinitions={COLUMNS as any}
        items={items}
        trackBy={'Id'}
        filter={
          <PropertyFilterPanel
            {...propertyFilterProps}
            countText={`${items.length} match${items.length !== 1 ? 'es' : ''}`}
            filteringPlaceholder={'Filter enterprise risks'}
            virtualScroll
          />
        }
        empty={
          rawItems.length === 0 ? (
            <EmptyEntityCollection entityLabel={'enterprise risk'} />
          ) : (
            <NoMatchesCollection
              onClearClick={() =>
                collectionProps.actions.setPropertyFiltering({
                  tokens: [],
                  operation: 'and',
                })
              }
            />
          )
        }
        pagination={<Pagination {...paginationProps} />}
      />
    </SpaceBetween>
  );
};

// ─── Page composition ─────────────────────────────────────────────────────────
//
// Full-page wrapper: RealProviders → AuthenticatedAppLayout (stub) → PageLayout.
//
// The picker is injected into GlobalHeader (dark navy topnav) via the
// `globalHeader` prop on the AuthenticatedAppLayout stub — exactly matching
// production where GlobalEntityPicker is a child of GlobalActions in the
// topnav. Previously it was in the `secondary` slot of PageLayout which
// incorrectly rendered it below the page title in the white sub-header.

type PageProps = {
  pickerVariant: 'tree' | 'flat';
  treeNodes?: EntityNode[];
  flatOptions?: typeof FLAT_LEAF_ONLY;
  initialSelectedId?: string;
  initialExpandedIds?: string[];
  popupForceOpen?: boolean;
  loadingEntities?: boolean;
  emptyEntities?: boolean;
  errorEntities?: boolean;
};

const ERMPage = ({
  pickerVariant,
  treeNodes = HIERARCHY_3_LEVEL,
  flatOptions = FLAT_LEAF_ONLY,
  initialSelectedId,
  initialExpandedIds = [],
  popupForceOpen = false,
  loadingEntities = false,
  emptyEntities = false,
  errorEntities = false,
}: PageProps) => {
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialSelectedId
  );

  const picker =
    pickerVariant === 'tree' ? (
      <EntityTreePicker
        nodes={treeNodes}
        initialSelectedId={initialSelectedId}
        initialExpandedIds={initialExpandedIds}
        popupForceOpen={popupForceOpen}
        loading={loadingEntities}
        empty={emptyEntities}
        error={errorEntities}
        onSelectionChange={setSelectedId}
      />
    ) : (
      <FlatEntityPicker options={flatOptions} popupForceOpen={popupForceOpen} />
    );

  // The picker goes into GlobalHeader (dark navy topnav) — this matches
  // production where GlobalEntityPicker is a GlobalActions child in the topnav.
  //
  // Page sub-header and ContentLayout are inlined verbatim from PageLayout.tsx
  // lines 182-224. We cannot use PageLayout(protected=true) here because it
  // would spawn a second AuthenticatedAppLayout. And PageLayout(protected=false)
  // just renders <>{children}</> — discarding the page header entirely. So we
  // lift the page header + ContentLayout structure directly.
  const riskCount = getVisibleRisks(selectedId).length;

  return (
    <RealProviders initialPath={'/enterprise-risks'}>
      <AuthenticatedAppLayout
        globalHeader={
          <GlobalHeader>
            {/* SystemActions: help/notifications/chat icons — matches production order */}
            <SystemActions
              toggleHelp={() => {}}
              toolsContent={undefined}
              toggleNotifications={() => {}}
              canViewNotifications={false}
              unreadNotificationCount={0}
              isChatEnabled={false}
              isChatOpen={false}
              showHelp={true}
              handleChatClick={() => {}}
            />
            {/* Entity picker — replaces GlobalEntityPicker in production */}
            {picker}
            {/* UserMenu — reads Auth0 context, shows 'James Romero / RiskSmart Inc.' */}
            <UserMenu logoutUrl={'/'} />
          </GlobalHeader>
        }
      >
        {/* Page sub-header — verbatim from PageLayout.tsx lines 182-208.
            Uses the same bg-white / px-7 py-5 / border-bottom structure. */}
        <div
          className={'print:hidden bg-white px-7 py-5 m-0'}
          style={{
            borderBottom: `1px solid ${colours['border-light'].backgroundColor}`,
          }}
        >
          <div className={'flex items-center flex-wrap mx-auto'}>
            <div className={'block w-full'}>
              <SpaceBetween size={'m'}>
                <PageHeader counter={`(${riskCount})`}>
                  {'Enterprise risks'}
                </PageHeader>
              </SpaceBetween>
            </div>
          </div>
        </div>

        {/* Content area — verbatim from PageLayout.tsx lines 210-223 */}
        <ContentLayout disableOverlap defaultPadding>
          <div className={'py-2'}>
            <SpaceBetween size={'m'}>
              <ERMRegister selectedId={selectedId} />
            </SpaceBetween>
          </div>
        </ContentLayout>
      </AuthenticatedAppLayout>
    </RealProviders>
  );
};

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Prototypes/RSP-5685 ERM Entity Hierarchy',
  component: PageLayout as any,
  tags: ['prototype'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'RSP-5685 prototype (revised). Collapsible entity hierarchy picker in the ERM topnav. ' +
          'Allows selection at any hierarchy level. Post-critique: nested-button bug fixed, ' +
          'duplicate pickers merged, auto-expand-to-selected, scope count in trigger, ' +
          'error state added. See _prototypes/RSP-5685/README.md for full AC coverage.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ──────────────────────────────────────────────────────────────────

// 1. Before — current flat list (status quo, leaf-only)
//    Shows the problem: USA/UK not selectable, no hierarchy visible.
export const Before: Story = {
  name: 'Before (Current — flat list)',
  render: () => <ERMPage pickerVariant={'flat'} popupForceOpen={true} />,
};

// 2. TreeDefault — new tree UI, nothing selected (Global scope)
//    USA and UK expanded. Auto-expand not relevant (no selection).
export const TreeDefault: Story = {
  name: 'Tree — Global (no selection)',
  render: () => (
    <ERMPage
      pickerVariant={'tree'}
      popupForceOpen={true}
      initialExpandedIds={['usa', 'uk']}
    />
  ),
};

// 3. LeafSelected — existing leaf-selection behaviour preserved.
//    Auto-expand ensures usa → northeast path is visible without user
//    having to manually expand.
export const LeafSelected: Story = {
  name: 'Tree — Leaf selected (New York)',
  render: () => (
    <ERMPage
      pickerVariant={'tree'}
      popupForceOpen={true}
      initialSelectedId={'ny'}
      // Auto-expand computes ['usa', 'northeast'] — no need to pass manually
    />
  ),
};

// 4. ParentSelected — NEW behaviour.
//    UK selected → popup shows "(2 entities)" inside row.
//    Trigger now shows "UK (2)" so scope is visible without opening picker.
export const ParentSelected: Story = {
  name: 'Tree — Parent selected (UK → 2 entities)',
  render: () => (
    <ERMPage
      pickerVariant={'tree'}
      popupForceOpen={true}
      initialSelectedId={'uk'}
      // Auto-expand computes [] (uk is top-level — no ancestors to expand)
    />
  ),
};

// 5. GrandparentSelected — 3-level hierarchy.
//    USA selected → trigger shows "USA (4)", popup shows "(4 entities)".
//    Register shows all 3 entities combined (NY, NJ, TX).
export const GrandparentSelected: Story = {
  name: 'Tree — Grandparent selected (USA → 4 entities)',
  render: () => (
    <ERMPage
      pickerVariant={'tree'}
      popupForceOpen={true}
      initialSelectedId={'usa'}
      initialExpandedIds={['usa', 'northeast']}
    />
  ),
};

// 6. CollapsedBranch — scale management.
//    USA branch collapsed, UK expanded. Shows how large orgs stay scannable.
export const CollapsedBranch: Story = {
  name: 'Tree — Collapsed branch (scale)',
  render: () => (
    <ERMPage
      pickerVariant={'tree'}
      popupForceOpen={true}
      initialExpandedIds={['uk']}
    />
  ),
};

// 7. Loading — entity query in-flight.
export const Loading: Story = {
  render: () => (
    <ERMPage
      pickerVariant={'tree'}
      popupForceOpen={true}
      loadingEntities={true}
    />
  ),
};

// 8. EmptyState — no entities configured.
export const EmptyState: Story = {
  name: 'Empty (no entities configured)',
  render: () => (
    <ERMPage
      pickerVariant={'tree'}
      popupForceOpen={true}
      emptyEntities={true}
    />
  ),
};

// 9. ErrorState — entity query failure. NEW in this revision.
//    Covers the case where the GraphQL request errors out.
export const ErrorState: Story = {
  name: 'Error (failed to load entities)',
  render: () => (
    <ERMPage
      pickerVariant={'tree'}
      popupForceOpen={true}
      errorEntities={true}
    />
  ),
};

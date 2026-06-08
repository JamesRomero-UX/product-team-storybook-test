import{r as u,j as t}from"./iframe-CGUFCU7f.js";import"./index-CfxlD8Xs.js";import"./index-BoMshO7v.js";import"./index-u3z_k5JR.js";import{c as T}from"./utils-DCYm8U2k.js";import{B as S}from"./index-D_36kx6Z.js";import"./index-CleBzkog.js";import"./index-DYvux3PE.js";import{f as k,a as B}from"./index-hmndAmaZ.js";import"./index-B39ZNkas.js";import"./index-D7p5Eoc-.js";import{l as j,m as i,u as q}from"./index-BNkbnloB.js";import"./index-C_wTxWsF.js";import"./index-CqZh1NEx.js";import"./index-CVrXcT1N.js";import"./index-BvgrfbWo.js";import"./index-DjlhEceD.js";import"./index-CV4kUk7g.js";import"./index-GQyngMHC.js";import"./index-Br16Q-tE.js";import"./index-BlnDAJH2.js";import{T as m}from"./index-DcccOjoR.js";import"./index-ZDUoC70O.js";import"./index-DsnuW-u7.js";import"./preload-helper-PPVm8Dsz.js";import"./index-B8k91cqS.js";import"./clsx-B-dksMZM.js";import"./useControlled-Kh7KOzPI.js";import"./useButton-DcZoe7g1.js";import"./useRenderElement-BQbCiycg.js";import"./composite-DQn3N0_v.js";import"./useBaseUiId-BP1KBVDm.js";import"./useOpenChangeComplete-Cv_A3jpp.js";import"./index-B7o473QB.js";import"./index-CuCU4ywu.js";import"./isElementDisabled-CwHw_lZC.js";import"./index-Ciqn2WuZ.js";import"./visuallyHidden-COI6QeQH.js";import"./useValueChanged-CPtaE3-O.js";import"./FieldItemContext-D--9e-7T.js";import"./getPseudoElementBounds-DYGPhbL6.js";import"./element-D-qatSgX.js";import"./composite-Bu3qC0n_.js";import"./react-BRx4GtcZ.js";import"./ToolbarRootContext-DMT3RUJ8.js";import"./CompositeItem-BS0OyaHZ.js";import"./CompositeRoot-B3WNgI_B.js";import"./useLabelableId-C1-TlTgd.js";import"./useRender-5o01eIur.js";import"./ToggleGroup-B-9Vf267.js";function O(a,n){const e=String(n.fromContainerId),o=String(n.toContainerId),{activeId:d,overIndex:b}=n;if(e===o){const p=a[e].indexOf(d);return{...a,[e]:j(a[e],p,b)}}const l=a[e].filter(p=>p!==d),c=a[o].filter(p=>p!==d);return c.splice(b,0,d),{...a,[e]:l,[o]:c}}const{expect:r,fn:R,userEvent:s,waitFor:N,within:x}=__STORYBOOK_MODULE_TEST__,Oe={title:"Components/Draggable",component:i,tags:["updated"],args:{items:[],onReorder:R()},decorators:[a=>t.jsx("div",{style:{width:"400px",margin:"0 auto"},children:t.jsx(a,{})})]},h=["Apple","Banana","Cherry","Date","Elderberry"],g=({className:a,withHandle:n=!1,children:e})=>t.jsx(k,{className:T(a),children:t.jsxs(B,{className:T("flex gap-3"),children:[n?t.jsx(i.DragHandle,{}):null,e]})}),L=()=>{const{activeId:a}=q();return t.jsx("div",{"data-testid":"drag-status",children:a!=null?`Dragging: ${String(a)}`:"Idle"})},y={render:()=>{const[a,n]=u.useState(h);return t.jsxs(i,{items:a,onReorder:n,className:"flex flex-col gap-2",children:[a.map(e=>t.jsx(i.Item,{id:e,children:t.jsx(g,{children:t.jsx(m,{preset:"heading-sm",children:e})})},e)),t.jsx(i.Overlay,{children:e=>t.jsx(g,{className:"shadow-lg",children:t.jsx(m,{preset:"heading-sm",children:e})})})]})},play:async({canvasElement:a})=>{const n=x(a),e=n.getAllByRole("button");await r(e).toHaveLength(5),await r(e[0]).toHaveTextContent("Apple"),await r(e[1]).toHaveTextContent("Banana"),await r(e[2]).toHaveTextContent("Cherry"),await r(e[3]).toHaveTextContent("Date"),await r(e[4]).toHaveTextContent("Elderberry"),e[0].focus(),await s.keyboard(" "),await s.keyboard("{ArrowDown}"),await s.keyboard(" ");const o=await n.findAllByRole("button");await r(o[0]).toHaveTextContent("Banana"),await r(o[1]).toHaveTextContent("Apple"),await r(o[2]).toHaveTextContent("Cherry"),o[0].focus(),await s.keyboard(" "),await s.keyboard("{Escape}");const d=n.getAllByRole("button");await r(d[0]).toHaveTextContent("Banana"),await r(d[1]).toHaveTextContent("Apple")}},v={render:()=>{const[a,n]=u.useState(h);return t.jsxs(i,{items:a,onReorder:n,className:"flex flex-col gap-2",children:[a.map(e=>t.jsx(i.Item,{id:e,children:t.jsx(g,{withHandle:!0,children:t.jsx(m,{preset:"heading-sm",children:e})})},e)),t.jsx(i.Overlay,{children:e=>t.jsx(g,{withHandle:!0,className:"shadow-lg",children:t.jsx(m,{preset:"heading-sm",children:e})})})]})},play:async({canvasElement:a})=>{const n=a.querySelectorAll('[data-slot="draggable-drag-handle"]');await r(n).toHaveLength(5);const e=a.querySelectorAll('[data-slot="draggable-item"]');for(const d of Array.from(e))await r(d).not.toHaveAttribute("role","button");const o=Array.from(e).map(d=>d.textContent?.trim());await r(o).toEqual(["Apple","Banana","Cherry","Date","Elderberry"])}},f={render:()=>{const[a,n]=u.useState(h);return t.jsx(i,{items:a,onReorder:n,className:"flex flex-col gap-2",children:a.map(e=>t.jsx(i.Item,{id:e,children:t.jsx(g,{withHandle:!0,children:t.jsx(m,{preset:"heading-sm",children:e})})},e))})},parameters:{docs:{description:{story:"⚠️ **Anti-pattern**: Omitting `Draggable.Overlay` is technically supported but not recommended. Without it, dnd-kit moves the actual DOM element during drag, which causes the dragged item to lose its droppable preview in the list. Always compose a `Draggable.Overlay` to render a properly styled replica."}}}},D={render:()=>{const[a,n]=u.useState(h),e=new Set(["Cherry"]);return t.jsxs(i,{items:a,onReorder:n,className:"flex flex-col gap-2",children:[a.map(o=>t.jsx(i.Item,{id:o,disabled:e.has(o),children:t.jsx(g,{children:t.jsxs(m,{preset:"heading-sm",children:[o," ",e.has(o)?"(disabled)":""]})})},o)),t.jsx(i.Overlay,{children:o=>t.jsx(g,{className:"shadow-lg",children:t.jsx(m,{preset:"heading-sm",children:o})})})]})},play:async({canvasElement:a})=>{const n=x(a),e=n.getByText("Cherry (disabled)").closest('[data-slot="draggable-item"]');await r(e).toHaveAttribute("data-disabled"),await r(e).toHaveAttribute("aria-disabled","true");const o=n.getByRole("button",{name:/Apple/});await r(o).not.toHaveAttribute("data-disabled"),await r(o).not.toHaveAttribute("aria-disabled","true"),o.focus(),await s.keyboard(" "),await s.keyboard("{ArrowDown}"),await s.keyboard(" ");const d=await n.findAllByRole("button");await r(d[0]).toHaveTextContent("Banana"),await r(d[1]).toHaveTextContent("Apple"),await r(d[2]).toHaveTextContent("Cherry")}},A={render:()=>{const[a,n]=u.useState(h);return t.jsxs(i,{items:a,onReorder:n,className:"flex flex-col gap-2",children:[t.jsx(L,{}),a.map(e=>t.jsx(i.Item,{id:e,children:t.jsx(g,{children:t.jsx(m,{preset:"heading-sm",children:e})})},e))]})},play:async({canvasElement:a})=>{const n=x(a);await r(n.getByTestId("drag-status")).toHaveTextContent("Idle"),n.getAllByRole("button")[0].focus(),await s.keyboard(" "),await r(n.getByTestId("drag-status")).toHaveTextContent("Dragging: Apple"),await s.keyboard("{Escape}"),await r(n.getByTestId("drag-status")).toHaveTextContent("Idle")}},C={render:()=>{const[a,n]=u.useState(["Nums 1","Group A","To Do List"]),[e,o]=u.useState({"Nums 1":["Num 1","Num 2","Num 3"],"Group A":["Item A","Item B","Item C"],"To Do List":["To Do: A","To Do: B","To Do: C"]}),d=u.useCallback(l=>o(c=>O(c,l)),[o]),b=({children:l})=>t.jsx(g,{withHandle:!0,children:t.jsxs("span",{className:"flex justify-between w-full flex-grow items-center",children:[t.jsx(m,{preset:"heading-sm",children:l}),t.jsx(S,{variant:"success"})]})});return t.jsxs(i.Multi,{containers:e,containerOrder:a,onMove:d,onReorderContainers:n,className:"flex flex-col gap-y-6",children:[a.map(l=>t.jsxs(i.Container,{id:l,items:e[l],isSortable:!0,className:"rounded-lg border border-neutral-300 p-4",children:[t.jsxs("div",{className:"mb-3 flex items-center gap-2",children:[t.jsx(i.DragHandle,{}),t.jsx(m,{preset:"heading-sm",children:l})]}),t.jsx("div",{className:"flex flex-col gap-1 pl-4",children:e[l].map(c=>t.jsx(i.Item,{id:c,children:t.jsx(b,{children:c})},c))})]},l)),t.jsx(i.Overlay,{children:l=>l in e?t.jsxs("div",{className:"rounded-lg border border-neutral-300 p-4 bg-white shadow-lg",children:[t.jsxs("div",{className:"mb-3 flex items-center gap-2",children:[t.jsx(i.DragHandle,{}),t.jsx(m,{preset:"heading-sm",children:String(l)})]}),t.jsx("div",{className:"flex flex-col gap-1 pl-4",children:e[l].map(c=>t.jsx(b,{children:c}))})]}):t.jsx(b,{children:l})})]})},play:async({canvasElement:a})=>{const n=x(a),e=a.querySelectorAll('[data-slot="draggable-container"]');await r(e).toHaveLength(3),await r(e[0]).toHaveAttribute("data-container-id","Nums 1"),await r(e[1]).toHaveAttribute("data-container-id","Group A"),await r(e[2]).toHaveAttribute("data-container-id","To Do List");for(const w of Array.from(e)){const E=w.querySelectorAll('[data-slot="draggable-item"]');await r(E).toHaveLength(3)}await r(n.getByText("Nums 1")).toBeVisible(),await r(n.getByText("Group A")).toBeVisible(),await r(n.getByText("To Do List")).toBeVisible();const o=e[0];o.querySelectorAll('[data-slot="draggable-item"] [data-slot="draggable-drag-handle"]')[0].focus(),await s.keyboard(" "),await s.keyboard("{ArrowDown}"),await s.keyboard(" "),await x(o).findByText("Num 2");const l=o.querySelectorAll('[data-slot="draggable-item"]');await r(l[0]).toHaveTextContent("Num 2"),await r(l[1]).toHaveTextContent("Num 1"),await r(l[2]).toHaveTextContent("Num 3");const c=Array.from(o.querySelectorAll('[data-slot="draggable-drag-handle"]')).find(w=>!w.closest('[data-slot="draggable-item"]'));c.focus(),await s.keyboard(" "),await s.keyboard("{Escape}"),await r(e[0]).toHaveAttribute("data-container-id","Nums 1"),c.focus(),await s.keyboard(" "),await s.keyboard("{ArrowDown}"),await s.keyboard("{ArrowDown}"),await s.keyboard(" "),await N(()=>{const w=a.querySelectorAll('[data-slot="draggable-container"]');r(w[0]).toHaveAttribute("data-container-id","Group A"),r(w[1]).toHaveAttribute("data-container-id","Nums 1")}),await N(()=>{r(a.querySelector("[data-dragging]")).toBeNull()});const p=a.querySelector('[data-container-id="Group A"]'),I=a.querySelector('[data-container-id="Nums 1"]'),H=p.querySelectorAll('[data-slot="draggable-item"] [data-slot="draggable-drag-handle"]');H[H.length-1].focus(),await s.keyboard(" "),await s.keyboard("{ArrowDown}"),await s.keyboard("{ArrowDown}"),await s.keyboard("{ArrowDown}"),await s.keyboard(" "),await x(I).findByText("Item C"),await r(p.querySelectorAll('[data-slot="draggable-item"]')).toHaveLength(2),await r(I.querySelectorAll('[data-slot="draggable-item"]')).toHaveLength(4)}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [items, setItems] = useState(defaultItems);
    return <Draggable items={items} onReorder={setItems as (items: UniqueIdentifier[]) => void} className={'flex flex-col gap-2'}>
        {items.map(item => <Draggable.Item key={item} id={item}>
            <DraggableCard>
              <Text preset={'heading-sm'}>{item}</Text>
            </DraggableCard>
          </Draggable.Item>)}
        <Draggable.Overlay>
          {activeId => <DraggableCard className={'shadow-lg'}>
              <Text preset={'heading-sm'}>{activeId}</Text>
            </DraggableCard>}
        </Draggable.Overlay>
      </Draggable>;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Without drag handles, dnd-kit spreads its attributes (role, tabIndex)
    // directly onto each Draggable.Item wrapper, making items keyboard-accessible.
    const items = canvas.getAllByRole('button');
    await expect(items).toHaveLength(5);
    await expect(items[0]).toHaveTextContent('Apple');
    await expect(items[1]).toHaveTextContent('Banana');
    await expect(items[2]).toHaveTextContent('Cherry');
    await expect(items[3]).toHaveTextContent('Date');
    await expect(items[4]).toHaveTextContent('Elderberry');

    // Keyboard drag: lift Apple → move one position down → drop.
    // dnd-kit keyboard flow: Space to lift, ArrowDown to move, Space to drop.
    items[0].focus();
    await userEvent.keyboard(' '); // lift
    await userEvent.keyboard('{ArrowDown}'); // shift one position down
    await userEvent.keyboard(' '); // drop

    // Banana should now occupy position 1, Apple position 2.
    const reordered = await canvas.findAllByRole('button');
    await expect(reordered[0]).toHaveTextContent('Banana');
    await expect(reordered[1]).toHaveTextContent('Apple');
    await expect(reordered[2]).toHaveTextContent('Cherry');

    // Escape cancels a drag without reordering — covers DraggableRoot.handleDragCancel.
    reordered[0].focus(); // Banana is now first
    await userEvent.keyboard(' '); // lift
    await userEvent.keyboard('{Escape}'); // cancel
    // Order is unchanged after the cancelled drag.
    const afterCancel = canvas.getAllByRole('button');
    await expect(afterCancel[0]).toHaveTextContent('Banana');
    await expect(afterCancel[1]).toHaveTextContent('Apple');
  }
}`,...y.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [items, setItems] = useState(defaultItems);
    return <Draggable items={items} onReorder={setItems as (items: UniqueIdentifier[]) => void} className={'flex flex-col gap-2'}>
        {items.map((item: UniqueIdentifier) => <Draggable.Item key={item} id={item}>
            <DraggableCard withHandle>
              <Text preset={'heading-sm'}>{item}</Text>
            </DraggableCard>
          </Draggable.Item>)}
        <Draggable.Overlay>
          {activeId => <DraggableCard withHandle className={'shadow-lg'}>
              <Text preset={'heading-sm'}>{activeId}</Text>
            </DraggableCard>}
        </Draggable.Overlay>
      </Draggable>;
  },
  play: async ({
    canvasElement
  }) => {
    // Every item should render exactly one drag handle.
    const handles = canvasElement.querySelectorAll('[data-slot="draggable-drag-handle"]');
    await expect(handles).toHaveLength(5);

    // When a DragHandle is registered, dnd-kit attributes (role, tabIndex) are
    // NOT spread onto the item wrapper — they are delegated to the handle.
    // Consequently, the item wrappers should not carry role="button".
    const itemWrappers = canvasElement.querySelectorAll('[data-slot="draggable-item"]');
    for (const item of Array.from(itemWrappers)) {
      await expect(item).not.toHaveAttribute('role', 'button');
    }

    // Items are still rendered in the correct initial order.
    const texts = Array.from(itemWrappers).map(el => el.textContent?.trim());
    await expect(texts).toEqual(['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry']);
  }
}`,...v.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [items, setItems] = useState(defaultItems);
    return <Draggable items={items} onReorder={setItems as (items: UniqueIdentifier[]) => void} className={'flex flex-col gap-2'}>
        {items.map((item: UniqueIdentifier) => <Draggable.Item key={item} id={item}>
            <DraggableCard withHandle>
              <Text preset={'heading-sm'}>{item}</Text>
            </DraggableCard>
          </Draggable.Item>)}
      </Draggable>;
  },
  parameters: {
    docs: {
      description: {
        story: '⚠️ **Anti-pattern**: Omitting \`Draggable.Overlay\` is technically supported but not recommended. Without it, dnd-kit moves the actual DOM element during drag, which causes the dragged item to lose its droppable preview in the list. Always compose a \`Draggable.Overlay\` to render a properly styled replica.'
      }
    }
  }
}`,...f.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [items, setItems] = useState(defaultItems);
    const disabledIds = new Set(['Cherry']);
    return <Draggable items={items} onReorder={setItems as (items: UniqueIdentifier[]) => void} className={'flex flex-col gap-2'}>
        {items.map(item => <Draggable.Item key={item} id={item} disabled={disabledIds.has(item)}>
            <DraggableCard>
              <Text preset={'heading-sm'}>
                {item} {disabledIds.has(item) ? '(disabled)' : ''}
              </Text>
            </DraggableCard>
          </Draggable.Item>)}
        <Draggable.Overlay>
          {activeId => <DraggableCard className={'shadow-lg'}>
              <Text preset={'heading-sm'}>{activeId}</Text>
            </DraggableCard>}
        </Draggable.Overlay>
      </Draggable>;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // --- Disabled item attributes ---

    // The Cherry item wrapper carries data-disabled (drives CSS via Tailwind
    // data-attribute variants) and aria-disabled from dnd-kit's attributes.
    const cherryWrapper = canvas.getByText('Cherry (disabled)').closest('[data-slot="draggable-item"]');
    await expect(cherryWrapper).toHaveAttribute('data-disabled');
    await expect(cherryWrapper).toHaveAttribute('aria-disabled', 'true');

    // Non-disabled items should carry aria-disabled="false" (dnd-kit always
    // emits the attribute) but must not have data-disabled.
    const appleButton = canvas.getByRole('button', {
      name: /Apple/
    });
    await expect(appleButton).not.toHaveAttribute('data-disabled');
    await expect(appleButton).not.toHaveAttribute('aria-disabled', 'true');

    // --- Drag still works for non-disabled items ---

    // Keyboard drag Apple down one position.
    appleButton.focus();
    await userEvent.keyboard(' '); // lift
    await userEvent.keyboard('{ArrowDown}'); // move down one position
    await userEvent.keyboard(' '); // drop

    // Banana should now be first; Apple second. Cherry remains in place (3rd).
    const reordered = await canvas.findAllByRole('button');
    await expect(reordered[0]).toHaveTextContent('Banana');
    await expect(reordered[1]).toHaveTextContent('Apple');
    await expect(reordered[2]).toHaveTextContent('Cherry');
  }
}`,...D.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [items, setItems] = useState(defaultItems);
    return <Draggable items={items} onReorder={setItems as (items: UniqueIdentifier[]) => void} className={'flex flex-col gap-2'}>
        <DragStatusBadge />
        {items.map(item => <Draggable.Item key={item} id={item}>
            <DraggableCard>
              <Text preset={'heading-sm'}>{item}</Text>
            </DraggableCard>
          </Draggable.Item>)}
      </Draggable>;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // useDraggableContext returns idle state when no drag is active.
    await expect(canvas.getByTestId('drag-status')).toHaveTextContent('Idle');

    // Lift an item — the context should now expose the active drag id.
    const items = canvas.getAllByRole('button');
    items[0].focus();
    await userEvent.keyboard(' '); // lift Apple
    await expect(canvas.getByTestId('drag-status')).toHaveTextContent('Dragging: Apple');
    await userEvent.keyboard('{Escape}'); // cancel
    await expect(canvas.getByTestId('drag-status')).toHaveTextContent('Idle');
  }
}`,...A.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [containerOrder, setContainerOrder] = useState(['Nums 1', 'Group A', 'To Do List']);
    const [containers, setContainers] = useState<Record<string, UniqueIdentifier[]>>({
      'Nums 1': ['Num 1', 'Num 2', 'Num 3'],
      'Group A': ['Item A', 'Item B', 'Item C'],
      'To Do List': ['To Do: A', 'To Do: B', 'To Do: C']
    });
    const handleMove = useCallback((event: DragMoveEvent) => setContainers(prev => applyDragMove(prev, event)), [setContainers]);
    const StoryItem = ({
      children
    }: {
      children: ReactNode;
    }) => <DraggableCard withHandle>
        <span className={'flex justify-between w-full flex-grow items-center'}>
          <Text preset={'heading-sm'}>{children}</Text>
          <BadgeIcon variant={'success'} />
        </span>
      </DraggableCard>;
    return <Draggable.Multi containers={containers} containerOrder={containerOrder} onMove={handleMove} onReorderContainers={setContainerOrder as (ids: UniqueIdentifier[]) => void} className={'flex flex-col gap-y-6'}>
        {containerOrder.map(groupId => <Draggable.Container key={groupId} id={groupId} items={containers[groupId]} isSortable className={'rounded-lg border border-neutral-300 p-4'}>
            <div className={'mb-3 flex items-center gap-2'}>
              <Draggable.DragHandle />
              <Text preset={'heading-sm'}>{groupId}</Text>
            </div>
            <div className={'flex flex-col gap-1 pl-4'}>
              {containers[groupId].map(itemId => <Draggable.Item key={itemId} id={itemId}>
                  <StoryItem>{itemId}</StoryItem>
                </Draggable.Item>)}
            </div>
          </Draggable.Container>)}
        <Draggable.Overlay>
          {activeId => {
          if (activeId in containers) {
            return <div className={'rounded-lg border border-neutral-300 p-4 bg-white shadow-lg'}>
                  <div className={'mb-3 flex items-center gap-2'}>
                    <Draggable.DragHandle />
                    <Text preset={'heading-sm'}>{String(activeId)}</Text>
                  </div>
                  <div className={'flex flex-col gap-1 pl-4'}>
                    {containers[activeId as string].map(itemId => <StoryItem>{itemId}</StoryItem>)}
                  </div>
                </div>;
          }
          return <StoryItem>{activeId}</StoryItem>;
        }}
        </Draggable.Overlay>
      </Draggable.Multi>;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // --- Structural assertions ---

    // Three containers, each with the correct data-container-id.
    const containerEls = canvasElement.querySelectorAll('[data-slot="draggable-container"]');
    await expect(containerEls).toHaveLength(3);
    await expect(containerEls[0]).toHaveAttribute('data-container-id', 'Nums 1');
    await expect(containerEls[1]).toHaveAttribute('data-container-id', 'Group A');
    await expect(containerEls[2]).toHaveAttribute('data-container-id', 'To Do List');

    // Each container starts with exactly 3 items.
    for (const container of Array.from(containerEls)) {
      const items = container.querySelectorAll('[data-slot="draggable-item"]');
      await expect(items).toHaveLength(3);
    }

    // Container labels are visible.
    await expect(canvas.getByText('Nums 1')).toBeVisible();
    await expect(canvas.getByText('Group A')).toBeVisible();
    await expect(canvas.getByText('To Do List')).toBeVisible();

    // --- Intra-container keyboard drag ---

    // Keyboard-drag the first item in "Nums 1" down one position.
    const numsContainer = containerEls[0] as HTMLElement;
    const itemHandles = numsContainer.querySelectorAll('[data-slot="draggable-item"] [data-slot="draggable-drag-handle"]');
    const firstItemHandle = itemHandles[0] as HTMLElement;
    firstItemHandle.focus();
    await userEvent.keyboard(' '); // lift
    await userEvent.keyboard('{ArrowDown}'); // move down one position
    await userEvent.keyboard(' '); // drop

    // "Num 2" should now be first in "Nums 1", "Num 1" second.
    await within(numsContainer).findByText('Num 2');
    const reorderedItems = numsContainer.querySelectorAll('[data-slot="draggable-item"]');
    await expect(reorderedItems[0]).toHaveTextContent('Num 2');
    await expect(reorderedItems[1]).toHaveTextContent('Num 1');
    await expect(reorderedItems[2]).toHaveTextContent('Num 3');

    // --- Drag cancel with Escape ---

    // Covers DraggableMultiRoot.handleDragCancel (multi.tsx:257-262).
    // Find the container-level handle for "Nums 1" (NOT inside a draggable-item).
    const containerHandle = Array.from(numsContainer.querySelectorAll('[data-slot="draggable-drag-handle"]')).find(el => !el.closest('[data-slot="draggable-item"]')) as HTMLElement;
    containerHandle.focus();
    await userEvent.keyboard(' '); // lift Nums 1 container
    await userEvent.keyboard('{Escape}'); // cancel — fires handleDragCancel
    // Container order is unchanged after the cancelled drag.
    await expect(containerEls[0]).toHaveAttribute('data-container-id', 'Nums 1');

    // Reorder containers
    containerHandle.focus();
    await userEvent.keyboard(' '); // lift
    await userEvent.keyboard('{ArrowDown}'); // move down one position
    await userEvent.keyboard('{ArrowDown}'); // move down one position
    await userEvent.keyboard(' '); // drop

    // "Group A" should now be first; "Nums 1" second.
    await waitFor(() => {
      const els = canvasElement.querySelectorAll('[data-slot="draggable-container"]');
      expect(els[0]).toHaveAttribute('data-container-id', 'Group A');
      expect(els[1]).toHaveAttribute('data-container-id', 'Nums 1');
    });

    // Wait for the drop animation to conclude before starting the next drag.
    // The dragged container carries data-dragging during the animation; once
    // it is absent the overlay has finished and dnd-kit is fully idle.
    await waitFor(() => {
      expect(canvasElement.querySelector('[data-dragging]')).toBeNull();
    });

    // --- Cross-container drag ---

    // Covers cross-container drag paths:
    //   - collision.ts:56  — rectIntersection fallback
    //   - collision.ts:64-77 — overId is a container → drill into items
    //   - collision.ts:86-88 — recentlyMovedToNewContainer fallback
    //   - constants.ts:46-51 — applyDragMove cross-container branch
    //
    // Re-query containers since the DOM order changed after the reorder above.
    // Group A is now first, Nums 1 second — drag the last item in Group A
    // (Item C) down one position into Nums 1.
    const groupAEl = canvasElement.querySelector('[data-container-id="Group A"]') as HTMLElement;
    const nums1El = canvasElement.querySelector('[data-container-id="Nums 1"]') as HTMLElement;
    const groupAHandles = groupAEl.querySelectorAll('[data-slot="draggable-item"] [data-slot="draggable-drag-handle"]');
    const lastGroupAHandle = groupAHandles[groupAHandles.length - 1] as HTMLElement;
    lastGroupAHandle.focus();
    await userEvent.keyboard(' '); // lift Item C
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}'); // move into Nums 1 below
    await userEvent.keyboard(' '); // drop

    // Item C should now be in Nums 1; Group A should have 2 items.
    await within(nums1El).findByText('Item C');
    await expect(groupAEl.querySelectorAll('[data-slot="draggable-item"]')).toHaveLength(2);
    await expect(nums1El.querySelectorAll('[data-slot="draggable-item"]')).toHaveLength(4);
  }
}`,...C.parameters?.docs?.source}}};const Re=["Default","WithDragHandle","WithoutOverlay","DisabledItems","WithDragContext","NestedDraggable"];export{y as Default,D as DisabledItems,C as NestedDraggable,A as WithDragContext,v as WithDragHandle,f as WithoutOverlay,Re as __namedExportsOrder,Oe as default};

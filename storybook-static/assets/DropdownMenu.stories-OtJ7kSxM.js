import{j as e}from"./iframe-CGUFCU7f.js";import{t as v,c as B}from"./utils-DCYm8U2k.js";import{B as c}from"./index-DYvux3PE.js";import{I as r}from"./index-CVrXcT1N.js";import{D as p,a as j,b as y,c as s,d as i,e as d,f as n,i as C}from"./index-C_wTxWsF.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./index-B8k91cqS.js";import"./useButton-DcZoe7g1.js";import"./useRenderElement-BQbCiycg.js";import"./useBaseUiId-BP1KBVDm.js";import"./getPseudoElementBounds-DYGPhbL6.js";import"./useOpenChangeComplete-Cv_A3jpp.js";import"./index-B7o473QB.js";import"./index-CuCU4ywu.js";import"./visuallyHidden-COI6QeQH.js";import"./composite-DQn3N0_v.js";import"./element-D-qatSgX.js";import"./composite-Bu3qC0n_.js";import"./ToolbarRootContext-DMT3RUJ8.js";import"./CompositeItem-BS0OyaHZ.js";const{expect:o,screen:a,userEvent:l,waitFor:T,within:f}=__STORYBOOK_MODULE_TEST__,te={title:"Components/DropdownMenu",component:n,subcomponents:{DropdownMenu:d,DropdownMenuTrigger:i,DropdownMenuContent:s,DropdownMenuGroup:y,DropdownMenuLabel:j,DropdownMenuSeparator:p},argTypes:{variant:{control:"select",options:Object.keys(C),description:"The visual style of the menu item"},disabled:{control:"boolean",description:"Whether the menu item is disabled"}},args:{variant:"default"},parameters:{docs:{description:{component:"A dropdown menu displays a list of actions or options that a user can choose from.\nBuilt on top of `@base-ui/react` Menu primitives."}}}},m={render:t=>e.jsxs(d,{children:[e.jsx(i,{render:e.jsxs(c,{variant:"neutral",children:[e.jsx(r,{name:"chevron-down",className:"transition-transform duration-150 group-data-[popup-open]:rotate-180"}),"Actions"]}),className:"group"}),e.jsxs(s,{align:"end",children:[e.jsxs(n,{...t,children:[e.jsx(r,{name:"play",size:"xs"}),"Start RCSA"]}),e.jsx(p,{}),e.jsxs(n,{...t,children:[e.jsx(r,{name:"layers-three-01",size:"xs"}),"Edit tabs"]}),e.jsxs(n,{...t,children:[e.jsx(r,{name:"file-06",size:"xs"}),"Edit form"]}),e.jsxs(n,{...t,variant:"destructive",children:[e.jsx(r,{name:"trash-01",size:"xs"}),"Delete Risk"]}),e.jsx(p,{}),e.jsxs(n,{...t,children:[e.jsx(r,{name:"download-01",size:"xs"}),"Export PDF"]})]})]}),play:async({canvasElement:t})=>{const u=f(t).getByRole("button",{name:/Actions/i});await o(u).toBeInTheDocument(),await l.click(u);const b=await a.findByRole("menuitem",{name:/Start RCSA/i});await T(()=>o(b).toBeInTheDocument());const S=a.getByRole("menuitem",{name:/Delete Risk/i});await o(S).toBeInTheDocument();const R=a.getAllByRole("separator");await o(R.length).toBe(2),await l.keyboard("{ArrowDown}"),await l.keyboard("{ArrowUp}"),await l.keyboard("{Escape}"),await T(()=>o(a.queryByRole("menuitem",{name:/Start RCSA/i})).not.toBeInTheDocument())}},w={render:()=>e.jsx("div",{className:B("story-tile-group"),children:Object.keys(C).map(t=>e.jsx("div",{className:B("story-tile"),children:e.jsxs(d,{children:[e.jsx(i,{render:e.jsx(c,{variant:"neutral",children:v(t)})}),e.jsx(s,{children:e.jsxs(n,{variant:t,children:[e.jsx(r,{name:t==="destructive"?"trash-01":"pencil-01",size:"xs"}),v(t)+" item"]})})]})},t))})},D={render:()=>e.jsxs(d,{children:[e.jsx(i,{render:e.jsx(c,{variant:"neutral",children:"Grouped menu"})}),e.jsxs(s,{children:[e.jsxs(y,{children:[e.jsx(j,{children:"Actions"}),e.jsxs(n,{children:[e.jsx(r,{name:"play",size:"xs"}),"Start RCSA"]})]}),e.jsx(p,{}),e.jsxs(y,{children:[e.jsx(j,{children:"Edit"}),e.jsxs(n,{children:[e.jsx(r,{name:"layers-three-01",size:"xs"}),"Edit tabs"]}),e.jsxs(n,{children:[e.jsx(r,{name:"file-06",size:"xs"}),"Edit form"]})]}),e.jsx(p,{}),e.jsxs(y,{children:[e.jsx(j,{children:"Danger zone"}),e.jsxs(n,{variant:"destructive",children:[e.jsx(r,{name:"trash-01",size:"xs"}),"Delete Risk"]})]})]})]}),play:async({canvasElement:t})=>{const u=f(t).getByRole("button",{name:/Grouped menu/i});await o(u).toBeInTheDocument(),await l.click(u);const b=await a.findByText(/Actions/i);await T(()=>o(b).toBeInTheDocument());const S=a.getByText("Edit");await o(S).toBeInTheDocument();const R=a.getByText(/Danger zone/i);await o(R).toBeInTheDocument();const A=a.getAllByRole("group");await o(A.length).toBe(3);const z=a.getAllByRole("separator");await o(z.length).toBe(2)}},x={render:()=>e.jsxs(d,{children:[e.jsx(i,{render:e.jsx(c,{variant:"neutral",children:"Text only"})}),e.jsxs(s,{children:[e.jsx(n,{children:"Start RCSA"}),e.jsx(p,{}),e.jsx(n,{children:"Edit tabs"}),e.jsx(n,{children:"Edit form"}),e.jsx(n,{variant:"destructive",children:"Delete Risk"}),e.jsx(p,{}),e.jsx(n,{children:"Export PDF"})]})]})},M={render:()=>e.jsxs(d,{children:[e.jsx(i,{render:e.jsx(c,{variant:"neutral",children:"Disabled items"})}),e.jsxs(s,{children:[e.jsxs(n,{children:[e.jsx(r,{name:"play",size:"xs"}),"Start RCSA"]}),e.jsxs(n,{disabled:!0,children:[e.jsx(r,{name:"layers-three-01",size:"xs"}),"Edit tabs"]}),e.jsx(p,{}),e.jsxs(n,{variant:"destructive",disabled:!0,children:[e.jsx(r,{name:"trash-01",size:"xs"}),"Delete Risk"]})]})]})},g={render:()=>e.jsx("div",{className:B("story-tile-group gap-[84px] flex flex-col"),children:["start","center","end"].map(t=>e.jsxs(d,{children:[e.jsx(i,{render:e.jsx(c,{variant:"neutral",children:v(t)})}),e.jsx(s,{align:t,children:e.jsxs(n,{children:[e.jsx(r,{name:"play",size:"xs"}),"Start RCSA"]})})]}))})},h={render:()=>e.jsx("div",{className:B("story-tile-group"),children:["inline-start","left","top","bottom","right","inline-end"].map(t=>e.jsxs(d,{children:[e.jsx(i,{render:e.jsx(c,{variant:"neutral",children:v(t)})}),e.jsx(s,{side:t,children:e.jsxs(n,{children:[e.jsx(r,{name:"play",size:"xs"}),"Start RCSA"]})})]}))})},I={render:()=>e.jsxs(d,{children:[e.jsx(i,{render:e.jsx(r,{name:"dots-vertical"}),className:"p-1"}),e.jsxs(s,{children:[e.jsxs(n,{children:[e.jsx(r,{name:"play",size:"xs"}),"Start RCSA"]}),e.jsxs(n,{children:[e.jsx(r,{name:"pencil-01",size:"xs"}),"Edit tabs"]})]})]})};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant={'neutral'}>
            <Icon name={'chevron-down'} className={'transition-transform duration-150 group-data-[popup-open]:rotate-180'} />
            {'Actions'}
          </Button>} className={'group'} />
      <DropdownMenuContent align={'end'}>
        <DropdownMenuItem {...args}>
          <Icon name={'play'} size={'xs'} />
          {'Start RCSA'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem {...args}>
          <Icon name={'layers-three-01'} size={'xs'} />
          {'Edit tabs'}
        </DropdownMenuItem>
        <DropdownMenuItem {...args}>
          <Icon name={'file-06'} size={'xs'} />
          {'Edit form'}
        </DropdownMenuItem>
        <DropdownMenuItem {...args} variant={'destructive'}>
          <Icon name={'trash-01'} size={'xs'} />
          {'Delete Risk'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem {...args}>
          <Icon name={'download-01'} size={'xs'} />
          {'Export PDF'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: /Actions/i
    });
    await expect(trigger).toBeInTheDocument();
    await userEvent.click(trigger);
    const startItem = await screen.findByRole('menuitem', {
      name: /Start RCSA/i
    });
    await waitFor(() => expect(startItem).toBeInTheDocument());
    const deleteItem = screen.getByRole('menuitem', {
      name: /Delete Risk/i
    });
    await expect(deleteItem).toBeInTheDocument();

    // -- Verify separators are rendered --
    const separators = screen.getAllByRole('separator');
    await expect(separators.length).toBe(2);

    // -- Test keyboard navigation and closing with Escape key --
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menuitem', {
      name: /Start RCSA/i
    })).not.toBeInTheDocument());
  }
}`,...m.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <div className={cn('story-tile-group')}>
      {Object.keys(itemVariant).map(variantName => <div key={variantName} className={cn('story-tile')}>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant={'neutral'}>{toTitleCase(variantName)}</Button>} />
            <DropdownMenuContent>
              <DropdownMenuItem variant={variantName as keyof typeof itemVariant}>
                <Icon name={variantName === 'destructive' ? 'trash-01' : 'pencil-01'} size={'xs'} />
                {toTitleCase(variantName) + ' item'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>)}
    </div>
}`,...w.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant={'neutral'}>{'Grouped menu'}</Button>} />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>{'Actions'}</DropdownMenuLabel>
          <DropdownMenuItem>
            <Icon name={'play'} size={'xs'} />
            {'Start RCSA'}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>{'Edit'}</DropdownMenuLabel>
          <DropdownMenuItem>
            <Icon name={'layers-three-01'} size={'xs'} />
            {'Edit tabs'}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon name={'file-06'} size={'xs'} />
            {'Edit form'}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>{'Danger zone'}</DropdownMenuLabel>
          <DropdownMenuItem variant={'destructive'}>
            <Icon name={'trash-01'} size={'xs'} />
            {'Delete Risk'}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: /Grouped menu/i
    });
    await expect(trigger).toBeInTheDocument();
    await userEvent.click(trigger);

    // -- Verify group labels are rendered (DropdownMenuLabel) --
    const actionGroupLabel = await screen.findByText(/Actions/i);
    await waitFor(() => expect(actionGroupLabel).toBeInTheDocument());
    const editGroupLabel = screen.getByText('Edit');
    await expect(editGroupLabel).toBeInTheDocument();
    const dangerGroupLabel = screen.getByText(/Danger zone/i);
    await expect(dangerGroupLabel).toBeInTheDocument();

    // -- Verify groups are rendered (DropdownMenuGroup) --
    const groups = screen.getAllByRole('group');
    await expect(groups.length).toBe(3);

    // -- Verify separators are rendered (DropdownMenuSeparator) --
    const separators = screen.getAllByRole('separator');
    await expect(separators.length).toBe(2);
  }
}`,...D.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant={'neutral'}>{'Text only'}</Button>} />
      <DropdownMenuContent>
        <DropdownMenuItem>{'Start RCSA'}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>{'Edit tabs'}</DropdownMenuItem>
        <DropdownMenuItem>{'Edit form'}</DropdownMenuItem>
        <DropdownMenuItem variant={'destructive'}>
          {'Delete Risk'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>{'Export PDF'}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
}`,...x.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant={'neutral'}>{'Disabled items'}</Button>} />
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Icon name={'play'} size={'xs'} />
          {'Start RCSA'}
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Icon name={'layers-three-01'} size={'xs'} />
          {'Edit tabs'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant={'destructive'} disabled>
          <Icon name={'trash-01'} size={'xs'} />
          {'Delete Risk'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
}`,...M.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div className={cn('story-tile-group gap-[84px] flex flex-col')}>
      {(['start', 'center', 'end'] as Align[]).map(align => <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant={'neutral'}>{toTitleCase(align!)}</Button>} />
          <DropdownMenuContent align={align}>
            <DropdownMenuItem>
              <Icon name={'play'} size={'xs'} />
              {'Start RCSA'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>)}
    </div>
}`,...g.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div className={cn('story-tile-group')}>
      {(['inline-start', 'left', 'top', 'bottom', 'right', 'inline-end'] as Side[]).map(side => <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant={'neutral'}>{toTitleCase(side!)}</Button>} />
          <DropdownMenuContent side={side}>
            <DropdownMenuItem>
              <Icon name={'play'} size={'xs'} />
              {'Start RCSA'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>)}
    </div>
}`,...h.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu>
      <DropdownMenuTrigger render={<Icon name={'dots-vertical'} />} className={'p-1'} />
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Icon name={'play'} size={'xs'} />
          {'Start RCSA'}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Icon name={'pencil-01'} size={'xs'} />
          {'Edit tabs'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
}`,...I.parameters?.docs?.source}}};const re=["Default","ItemVariants","WithGroups","ItemsWithoutIcons","DisabledItems","ContentAlignment","ContentSide","IconTrigger"];export{g as ContentAlignment,h as ContentSide,m as Default,M as DisabledItems,I as IconTrigger,w as ItemVariants,x as ItemsWithoutIcons,D as WithGroups,re as __namedExportsOrder,te as default};

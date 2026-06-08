import{j as e}from"./iframe-CGUFCU7f.js";import"./index-CfxlD8Xs.js";import"./index-BoMshO7v.js";import"./index-u3z_k5JR.js";import"./index-Ciqn2WuZ.js";import"./index-D_36kx6Z.js";import"./index-CleBzkog.js";import"./index-DYvux3PE.js";import"./index-hmndAmaZ.js";import"./index-B39ZNkas.js";import"./index-D7p5Eoc-.js";import"./index-BNkbnloB.js";import{f as n}from"./index-C_wTxWsF.js";import"./index-CqZh1NEx.js";import{I as t}from"./index-CVrXcT1N.js";import"./index-BvgrfbWo.js";import"./index-DjlhEceD.js";import"./index-CV4kUk7g.js";import"./index-GQyngMHC.js";import"./index-Br16Q-tE.js";import"./index-BlnDAJH2.js";import"./index-ZDUoC70O.js";import"./index-DsnuW-u7.js";import{O as v}from"./index-CQbuQdLb.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-DCYm8U2k.js";import"./clsx-B-dksMZM.js";import"./index-B8k91cqS.js";import"./useControlled-Kh7KOzPI.js";import"./useButton-DcZoe7g1.js";import"./useRenderElement-BQbCiycg.js";import"./composite-DQn3N0_v.js";import"./useBaseUiId-BP1KBVDm.js";import"./useOpenChangeComplete-Cv_A3jpp.js";import"./index-B7o473QB.js";import"./index-CuCU4ywu.js";import"./isElementDisabled-CwHw_lZC.js";import"./index-DcccOjoR.js";import"./useRender-5o01eIur.js";import"./visuallyHidden-COI6QeQH.js";import"./useValueChanged-CPtaE3-O.js";import"./FieldItemContext-D--9e-7T.js";import"./getPseudoElementBounds-DYGPhbL6.js";import"./element-D-qatSgX.js";import"./composite-Bu3qC0n_.js";import"./react-BRx4GtcZ.js";import"./ToolbarRootContext-DMT3RUJ8.js";import"./CompositeItem-BS0OyaHZ.js";import"./CompositeRoot-B3WNgI_B.js";import"./useLabelableId-C1-TlTgd.js";import"./ToggleGroup-B-9Vf267.js";const{expect:r,fn:o,screen:w,userEvent:u,waitFor:y,within:D}=__STORYBOOK_MODULE_TEST__,we={title:"Patterns/ObjectLevelHeader",component:v,tags:["wip"],argTypes:{title:{control:"text",description:"The object title displayed in the header"},counter:{control:"number",description:"Optional count displayed next to the title"},isObjectDirty:{control:"boolean",description:"Indicates if the object has unsaved changes"}},args:{title:"Example Risk",onAdd:o(),onSave:o(),onCancel:o()},decorators:[l=>e.jsx("div",{style:{minWidth:"600px",margin:"0 auto"},children:e.jsx(l,{})})],parameters:{docs:{description:{component:`A object-level header bar with a title, optional add/save/cancel actions,
and an optional kebab menu for additional actions.`}}}},i={args:{menuContent:e.jsxs(e.Fragment,{children:[e.jsxs(n,{children:[e.jsx(t,{name:"play",size:"sm"}),"Start RCSA"]}),e.jsxs(n,{children:[e.jsx(t,{name:"pencil-01",size:"sm"}),"Edit tabs"]}),e.jsxs(n,{variant:"destructive",children:[e.jsx(t,{name:"trash-01",size:"sm"}),"Delete Risk"]})]})},play:async({canvasElement:l})=>{const a=D(l);await r(a.getByText("Example Risk")).toBeInTheDocument(),await r(a.getByRole("button",{name:/Save/i})).toBeInTheDocument(),await r(a.getByRole("button",{name:/Cancel/i})).toBeInTheDocument();const h=a.getByRole("button",{name:/More options/i});await u.click(h);const g=await w.findByRole("menuitem",{name:/Delete Risk/i});await y(()=>r(g).toBeInTheDocument()),await u.keyboard("{Escape}")}},s={args:{menuContent:void 0}},m={args:{onAdd:void 0,onSave:void 0,onCancel:void 0,menuContent:void 0}},c={args:{counter:12,menuContent:e.jsxs(n,{children:[e.jsx(t,{name:"pencil-01",size:"sm"}),"Edit"]})}},p={args:{additionalActions:[{label:"Start RCSA",iconName:"play",onClick:o()},{label:"Delete risk",iconName:"trash-01",onClick:o(),variant:"destructive",style:"ghost"}]}},d={args:{isObjectDirty:!0,menuContent:e.jsxs(n,{children:[e.jsx(t,{name:"pencil-01",size:"sm"}),"Edit"]})}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    menuContent: <>
        <DropdownMenuItem>
          <Icon name={'play'} size={'sm'} />
          {'Start RCSA'}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Icon name={'pencil-01'} size={'sm'} />
          {'Edit tabs'}
        </DropdownMenuItem>
        <DropdownMenuItem variant={'destructive'}>
          <Icon name={'trash-01'} size={'sm'} />
          {'Delete Risk'}
        </DropdownMenuItem>
      </>
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Example Risk')).toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: /Save/i
    })).toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: /Cancel/i
    })).toBeInTheDocument();
    const menuTrigger = canvas.getByRole('button', {
      name: /More options/i
    });
    await userEvent.click(menuTrigger);
    const deleteItem = await screen.findByRole('menuitem', {
      name: /Delete Risk/i
    });
    await waitFor(() => expect(deleteItem).toBeInTheDocument());
    await userEvent.keyboard('{Escape}');
  }
}`,...i.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    menuContent: undefined
  }
}`,...s.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    onAdd: undefined,
    onSave: undefined,
    onCancel: undefined,
    menuContent: undefined
  }
}`,...m.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    counter: 12,
    menuContent: <DropdownMenuItem>
        <Icon name={'pencil-01'} size={'sm'} />
        {'Edit'}
      </DropdownMenuItem>
  }
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    additionalActions: [{
      label: 'Start RCSA',
      iconName: 'play',
      onClick: fn()
    }, {
      label: 'Delete risk',
      iconName: 'trash-01',
      onClick: fn(),
      variant: 'destructive',
      style: 'ghost'
    }]
  }
}`,...p.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    isObjectDirty: true,
    menuContent: <DropdownMenuItem>
        <Icon name={'pencil-01'} size={'sm'} />
        {'Edit'}
      </DropdownMenuItem>
  }
}`,...d.parameters?.docs?.source}}};const ye=["Default","WithoutMenu","TitleOnly","WithCounter","WithAdditionalActions","WithChanges"];export{i as Default,m as TitleOnly,p as WithAdditionalActions,d as WithChanges,c as WithCounter,s as WithoutMenu,ye as __namedExportsOrder,we as default};

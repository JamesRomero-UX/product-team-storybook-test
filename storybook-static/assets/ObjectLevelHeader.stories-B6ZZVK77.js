import{j as e}from"./iframe-BUnym78j.js";import"./index-Bb02TIDQ.js";import"./index-CRRpMv4h.js";import"./index-xq-ASM7n.js";import"./index-Ciqn2WuZ.js";import"./index-C7yTHsRP.js";import"./index-CuxF2Xv5.js";import"./index-BY0kkQuY.js";import"./index-ZDq-Xeuo.js";import"./index-QRMnmSvI.js";import"./index-Dyi5WUzK.js";import"./index-DIH3eVzB.js";import{f as n}from"./index-aDmoPMh2.js";import"./index-j7EGGt3t.js";import{I as t}from"./index-DAsga1CA.js";import"./index-Bs1e9xXM.js";import"./index-Dpl2HS8H.js";import"./index-D_NKJ0UL.js";import"./index-DGeIQDaT.js";import"./index-EvlZhN_f.js";import"./index-CtjIrCBO.js";import"./index-OzwKdUUK.js";import"./index-D3K7Ywc6.js";import{O as v}from"./index-D5cl1MV-.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-DCYm8U2k.js";import"./clsx-B-dksMZM.js";import"./index-B8k91cqS.js";import"./useControlled-5C_FWl0K.js";import"./useButton-P9eg-YPj.js";import"./useRenderElement-Ca5MjKVy.js";import"./composite-BSwB0I7Y.js";import"./useBaseUiId-DDkm6U0i.js";import"./useOpenChangeComplete-DBFoL7rn.js";import"./index-Cjedr7LG.js";import"./index-BrQu0-NH.js";import"./isElementDisabled-CwHw_lZC.js";import"./index-BQ2MBVFQ.js";import"./useRender-C6qmYnVs.js";import"./visuallyHidden-COI6QeQH.js";import"./useValueChanged-BJTqdMqD.js";import"./FieldItemContext-Z1YcxDG6.js";import"./getPseudoElementBounds-Cq9a3pKD.js";import"./element-y_ycQrD6.js";import"./composite-CZocG8cQ.js";import"./react-BDbfsZLH.js";import"./ToolbarRootContext-pHPS9ZKC.js";import"./CompositeItem-DbknVT3w.js";import"./CompositeRoot-DNhtb6u4.js";import"./useLabelableId-C-vyVutt.js";import"./ToggleGroup-7_ZqpcRz.js";const{expect:r,fn:o,screen:w,userEvent:u,waitFor:y,within:D}=__STORYBOOK_MODULE_TEST__,we={title:"Patterns/ObjectLevelHeader",component:v,tags:["wip"],argTypes:{title:{control:"text",description:"The object title displayed in the header"},counter:{control:"number",description:"Optional count displayed next to the title"},isObjectDirty:{control:"boolean",description:"Indicates if the object has unsaved changes"}},args:{title:"Example Risk",onAdd:o(),onSave:o(),onCancel:o()},decorators:[l=>e.jsx("div",{style:{minWidth:"600px",margin:"0 auto"},children:e.jsx(l,{})})],parameters:{docs:{description:{component:`A object-level header bar with a title, optional add/save/cancel actions,
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

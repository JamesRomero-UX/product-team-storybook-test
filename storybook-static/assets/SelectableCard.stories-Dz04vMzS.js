import{j as e,r as y}from"./iframe-BUnym78j.js";import"./index-Bb02TIDQ.js";import"./index-CRRpMv4h.js";import{A as r}from"./index-xq-ASM7n.js";import{B as x}from"./index-CBziSGNp.js";import"./index-C7yTHsRP.js";import"./index-CuxF2Xv5.js";import"./index-BY0kkQuY.js";import"./index-ZDq-Xeuo.js";import"./index-QRMnmSvI.js";import"./index-Dyi5WUzK.js";import"./index-DIH3eVzB.js";import"./index-aDmoPMh2.js";import"./index-j7EGGt3t.js";import"./index-DAsga1CA.js";import"./index-Bs1e9xXM.js";import"./index-Dpl2HS8H.js";import"./index-D_NKJ0UL.js";import{S}from"./index-DGeIQDaT.js";import"./index-EvlZhN_f.js";import{S as j}from"./index-CtjIrCBO.js";import{c as E}from"./utils-DCYm8U2k.js";import"./index-OzwKdUUK.js";import"./index-D3K7Ywc6.js";import{S as n,a as d,b as o,c as b,d as h,e as m,f as p}from"./index-DyPGf3Eo.js";import"./preload-helper-PPVm8Dsz.js";import"./index-B8k91cqS.js";import"./clsx-B-dksMZM.js";import"./useControlled-5C_FWl0K.js";import"./useButton-P9eg-YPj.js";import"./useRenderElement-Ca5MjKVy.js";import"./composite-BSwB0I7Y.js";import"./useBaseUiId-DDkm6U0i.js";import"./useOpenChangeComplete-DBFoL7rn.js";import"./index-Cjedr7LG.js";import"./index-BrQu0-NH.js";import"./isElementDisabled-CwHw_lZC.js";import"./useRender-C6qmYnVs.js";import"./index-BQ2MBVFQ.js";import"./visuallyHidden-COI6QeQH.js";import"./useValueChanged-BJTqdMqD.js";import"./FieldItemContext-Z1YcxDG6.js";import"./getPseudoElementBounds-Cq9a3pKD.js";import"./element-y_ycQrD6.js";import"./composite-CZocG8cQ.js";import"./react-BDbfsZLH.js";import"./ToolbarRootContext-pHPS9ZKC.js";import"./CompositeItem-DbknVT3w.js";import"./CompositeRoot-DNhtb6u4.js";import"./useLabelableId-C-vyVutt.js";import"./index-Ciqn2WuZ.js";import"./ToggleGroup-7_ZqpcRz.js";const{useArgs:F}=__STORYBOOK_MODULE_PREVIEW_API__,{expect:a,userEvent:w,within:l}=__STORYBOOK_MODULE_TEST__,Fe={title:"Patterns/SelectableCard",component:p,subcomponents:{SelectableCardHeader:m,SelectableCardTitle:h,SelectableCardDescription:b,SelectableCardAction:o,SelectableCardFooter:d,AlertStatus:r,SelectableCardStatus:n},argTypes:{enabled:{control:"boolean",description:"Whether the card is checked (toggled on)"},selected:{control:"boolean",description:"Whether the card is active (blue border)"},hasSwitch:{control:"boolean",description:"Story Prop: Whether the card has a switch in the footer"}},parameters:{docs:{description:{component:"Selectable card pattern with `enabled` (interactivity) and `selected` (visual state). Use in pairs to allow mutual selection."}}},render:()=>{const[c,u]=F(),i=c.enabled??!1,v=c.selected??!1,s=c.hasSwitch??!0;return e.jsxs(p,{enabled:i,selected:v,onClick:()=>u({selected:!v}),children:[e.jsxs(m,{children:[e.jsx(h,{children:"This is a selectable card title"}),e.jsx(b,{children:"This is a selectable card description"}),e.jsx(o,{children:e.jsx(x,{size:"sm",variant:i?"success":"muted",children:i?"READY":"OFF"})})]}),e.jsx(S,{}),e.jsxs(d,{children:[e.jsx(r,{variant:i?"active":"inactive"}),e.jsx(n,{children:i?"Active":"Inactive"}),s?e.jsx(j,{checked:i,onCheckedChange:t=>{u({enabled:t,selected:t})},"aria-label":"Toggle selection",size:"lg"}):null]})]})},args:{enabled:!1,selected:!1,hasSwitch:!0},decorators:[c=>e.jsx("div",{style:{minWidth:"600px",margin:"0 auto"},children:e.jsx(c,{})})]},T={},A={name:"Switch",render:()=>e.jsxs("div",{className:E("grid gap-4"),children:[e.jsxs(p,{enabled:!1,selected:!1,children:[e.jsxs(m,{children:[e.jsx(h,{children:"This is a selectable card title"}),e.jsx(b,{children:"This is a selectable card description"}),e.jsx(o,{children:e.jsx(x,{size:"sm",variant:"muted",children:"OFF"})})]}),e.jsx(S,{}),e.jsxs(d,{children:[e.jsx(r,{variant:"inactive"}),e.jsx(n,{children:"Inactive"}),e.jsx(j,{checked:!1,"aria-label":"Toggle selection",size:"lg"})]})]}),e.jsxs(p,{enabled:!0,selected:!1,children:[e.jsxs(m,{children:[e.jsx(h,{children:"This is a selectable card title"}),e.jsx(b,{children:"This is a selectable card description"}),e.jsx(o,{children:e.jsx(x,{size:"sm",variant:"success",children:"READY"})})]}),e.jsx(S,{}),e.jsxs(d,{children:[e.jsx(r,{variant:"active"}),e.jsx(n,{children:"Active"}),e.jsx(j,{checked:!0,"aria-label":"Toggle selection",size:"lg"})]})]}),e.jsxs(p,{enabled:!0,selected:!0,children:[e.jsxs(m,{children:[e.jsx(h,{children:"This is selectable card title"}),e.jsx(b,{children:"This is selectable card description"}),e.jsx(o,{children:e.jsx(x,{size:"sm",variant:"success",children:"READY"})})]}),e.jsx(S,{}),e.jsxs(d,{children:[e.jsx(r,{variant:"active"}),e.jsx(n,{children:"Active"}),e.jsx(j,{checked:!0,"aria-label":"Toggle selection",size:"lg"})]})]})]})},B={render:()=>e.jsxs("div",{className:E("grid gap-4"),children:[e.jsxs(p,{enabled:!0,selected:!1,children:[e.jsxs(m,{children:[e.jsx(h,{children:"This is a selectable card title"}),e.jsx(b,{children:"This is a selectable card description"}),e.jsx(o,{children:e.jsx(x,{size:"sm",variant:"success",children:"READY"})})]}),e.jsx(S,{}),e.jsxs(d,{children:[e.jsx(r,{variant:"active"}),e.jsx(n,{children:"Always Active"})]})]}),e.jsxs(p,{enabled:!0,selected:!0,children:[e.jsxs(m,{children:[e.jsx(h,{children:"This is selectable card title"}),e.jsx(b,{children:"This is selectable card description"}),e.jsx(o,{children:e.jsx(x,{size:"sm",variant:"success",children:"READY"})})]}),e.jsx(S,{}),e.jsxs(d,{children:[e.jsx(r,{variant:"active"}),e.jsx(n,{children:"Always Active"})]})]})]})},D=()=>{},R=()=>{const[c,u]=y.useState(!0),[i,v]=y.useState(!1),[s,t]=y.useState("top");return e.jsxs("div",{className:E("grid gap-4"),children:[e.jsxs(p,{enabled:!0,selected:s==="top",onClick:()=>t("top"),children:[e.jsxs(m,{children:[e.jsx(h,{children:"This is a selectable card title"}),e.jsx(b,{children:"This is a selectable card description"}),e.jsx(o,{children:e.jsx(x,{size:"sm",variant:"success",children:"READY"})})]}),e.jsx(S,{}),e.jsxs(d,{children:[e.jsx(r,{variant:"active"}),e.jsx(n,{children:"Always Active"})]})]}),e.jsxs(p,{enabled:!0,selected:s==="middle",onClick:()=>t("middle"),onKeyDown:D,children:[e.jsxs(m,{children:[e.jsx(h,{children:"This is a selectable card title"}),e.jsx(b,{children:"This is a selectable card description"}),e.jsx(o,{children:e.jsx(x,{size:"sm",variant:c?"success":"muted",children:c?"READY":"OFF"})})]}),e.jsx(S,{}),e.jsxs(d,{onClick:D,children:[e.jsx(r,{variant:c?"active":"inactive"}),e.jsx(n,{children:c?"Active":"Inactive"}),e.jsx(j,{checked:c,onCheckedChange:C=>{u(C),t(C?"middle":"top")},"aria-label":"Toggle selection",size:"lg"})]})]}),e.jsxs(p,{enabled:i,selected:s==="bottom",onClick:()=>t("bottom"),children:[e.jsxs(m,{children:[e.jsx(h,{children:"This is another selectable card title"}),e.jsx(b,{children:"This is another selectable card description"}),e.jsx(o,{children:e.jsx(x,{size:"sm",variant:i?"success":"muted",children:i?"READY":"OFF"})})]}),e.jsx(S,{}),e.jsxs(d,{children:[e.jsx(r,{variant:i?"active":"inactive"}),e.jsx(n,{children:i?"Active":"Inactive"}),e.jsx(j,{checked:i,onCheckedChange:C=>{v(C),t(C?"bottom":"top")},"aria-label":"Toggle selection",size:"lg"})]})]})]})},g={render:()=>e.jsx(R,{}),play:async({canvasElement:c})=>{const u=l(c),i=u.getAllByTestId("selectable-card"),v=i[0],s=i[1],t=i[2],C=u.getAllByRole("switch"),k=C[0],f=C[1];await a(v).toHaveRole("button"),await a(s).toHaveRole("button"),await a(t).toHaveAttribute("aria-disabled","true"),await a(l(t).getByText("Inactive")).toBeVisible(),s.focus(),await w.keyboard("{Enter}"),await a(l(s).getByText("Active")).toBeVisible(),await w.click(v),await a(l(v).getByText("Always Active")).toBeVisible(),s.focus(),await w.keyboard(" "),await a(l(s).getByText("Active")).toBeVisible(),await w.click(k),await a(l(s).getByText("Inactive")).toBeVisible(),await a(l(s).getByText("OFF")).toBeVisible(),await w.click(k),await a(l(s).getByText("Active")).toBeVisible(),await a(l(s).getByText("READY")).toBeVisible(),await w.click(f),await a(t).toHaveRole("button"),await a(t).not.toHaveAttribute("aria-disabled"),await a(l(t).getByText("Active")).toBeVisible(),await a(l(t).getByText("READY")).toBeVisible(),await w.click(f),await a(t).toHaveAttribute("aria-disabled","true"),await a(l(t).getByText("Inactive")).toBeVisible(),await a(l(t).getByText("OFF")).toBeVisible()}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:"{}",...T.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'Switch',
  render: () => <div className={cn('grid gap-4')}>
      <SelectableCard enabled={false} selected={false}>
        <SelectableCardHeader>
          <SelectableCardTitle>
            {'This is a selectable card title'}
          </SelectableCardTitle>
          <SelectableCardDescription>
            {'This is a selectable card description'}
          </SelectableCardDescription>
          <SelectableCardAction>
            <Badge size={'sm'} variant={'muted'}>
              {'OFF'}
            </Badge>
          </SelectableCardAction>
        </SelectableCardHeader>
        <Separator />
        <SelectableCardFooter>
          <AlertStatus variant={'inactive'} />
          <SelectableCardStatus>{'Inactive'}</SelectableCardStatus>
          <Switch checked={false} aria-label={'Toggle selection'} size={'lg'} />
        </SelectableCardFooter>
      </SelectableCard>
      <SelectableCard enabled={true} selected={false}>
        <SelectableCardHeader>
          <SelectableCardTitle>
            {'This is a selectable card title'}
          </SelectableCardTitle>
          <SelectableCardDescription>
            {'This is a selectable card description'}
          </SelectableCardDescription>
          <SelectableCardAction>
            <Badge size={'sm'} variant={'success'}>
              {'READY'}
            </Badge>
          </SelectableCardAction>
        </SelectableCardHeader>
        <Separator />
        <SelectableCardFooter>
          <AlertStatus variant={'active'} />
          <SelectableCardStatus>{'Active'}</SelectableCardStatus>
          <Switch checked={true} aria-label={'Toggle selection'} size={'lg'} />
        </SelectableCardFooter>
      </SelectableCard>
      <SelectableCard enabled={true} selected={true}>
        <SelectableCardHeader>
          <SelectableCardTitle>
            {'This is selectable card title'}
          </SelectableCardTitle>
          <SelectableCardDescription>
            {'This is selectable card description'}
          </SelectableCardDescription>
          <SelectableCardAction>
            <Badge size={'sm'} variant={'success'}>
              {'READY'}
            </Badge>
          </SelectableCardAction>
        </SelectableCardHeader>
        <Separator />
        <SelectableCardFooter>
          <AlertStatus variant={'active'} />
          <SelectableCardStatus>{'Active'}</SelectableCardStatus>
          <Switch checked={true} aria-label={'Toggle selection'} size={'lg'} />
        </SelectableCardFooter>
      </SelectableCard>
    </div>
}`,...A.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <div className={cn('grid gap-4')}>
      <SelectableCard enabled={true} selected={false}>
        <SelectableCardHeader>
          <SelectableCardTitle>
            {'This is a selectable card title'}
          </SelectableCardTitle>
          <SelectableCardDescription>
            {'This is a selectable card description'}
          </SelectableCardDescription>
          <SelectableCardAction>
            <Badge size={'sm'} variant={'success'}>
              {'READY'}
            </Badge>
          </SelectableCardAction>
        </SelectableCardHeader>
        <Separator />
        <SelectableCardFooter>
          <AlertStatus variant={'active'} />
          <SelectableCardStatus>{'Always Active'}</SelectableCardStatus>
        </SelectableCardFooter>
      </SelectableCard>
      <SelectableCard enabled={true} selected={true}>
        <SelectableCardHeader>
          <SelectableCardTitle>
            {'This is selectable card title'}
          </SelectableCardTitle>
          <SelectableCardDescription>
            {'This is selectable card description'}
          </SelectableCardDescription>
          <SelectableCardAction>
            <Badge size={'sm'} variant={'success'}>
              {'READY'}
            </Badge>
          </SelectableCardAction>
        </SelectableCardHeader>
        <Separator />
        <SelectableCardFooter>
          <AlertStatus variant={'active'} />
          <SelectableCardStatus>{'Always Active'}</SelectableCardStatus>
        </SelectableCardFooter>
      </SelectableCard>
    </div>
}`,...B.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <SelectableCardWithState />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const cards = canvas.getAllByTestId('selectable-card');
    const topCard = cards[0];
    const middleCard = cards[1];
    const bottomCard = cards[2];
    const switches = canvas.getAllByRole('switch');
    const middleSwitch = switches[0];
    const bottomSwitch = switches[1];

    // -- Initial state: top selected, middle enabled, bottom disabled --
    await expect(topCard).toHaveRole('button');
    await expect(middleCard).toHaveRole('button');
    await expect(bottomCard).toHaveAttribute('aria-disabled', 'true');
    await expect(within(bottomCard).getByText('Inactive')).toBeVisible();

    // -- Select middle card via Enter key (covers handleKeyDown lines 22-24) --
    middleCard.focus();
    await userEvent.keyboard('{Enter}');
    await expect(within(middleCard).getByText('Active')).toBeVisible();

    // -- Select top card via click --
    await userEvent.click(topCard);
    await expect(within(topCard).getByText('Always Active')).toBeVisible();

    // -- Select middle card via Space key (covers handleKeyDown line 22) --
    middleCard.focus();
    await userEvent.keyboard(' ');
    await expect(within(middleCard).getByText('Active')).toBeVisible();

    // -- Toggle middle switch off → middle disabled, selection returns to top --
    await userEvent.click(middleSwitch);
    await expect(within(middleCard).getByText('Inactive')).toBeVisible();
    await expect(within(middleCard).getByText('OFF')).toBeVisible();

    // -- Toggle middle switch back on → middle enabled and selected --
    await userEvent.click(middleSwitch);
    await expect(within(middleCard).getByText('Active')).toBeVisible();
    await expect(within(middleCard).getByText('READY')).toBeVisible();

    // -- Toggle bottom switch on → bottom enabled and selected --
    await userEvent.click(bottomSwitch);
    await expect(bottomCard).toHaveRole('button');
    await expect(bottomCard).not.toHaveAttribute('aria-disabled');
    await expect(within(bottomCard).getByText('Active')).toBeVisible();
    await expect(within(bottomCard).getByText('READY')).toBeVisible();

    // -- Toggle bottom switch off → bottom disabled, selection returns to top --
    await userEvent.click(bottomSwitch);
    await expect(bottomCard).toHaveAttribute('aria-disabled', 'true');
    await expect(within(bottomCard).getByText('Inactive')).toBeVisible();
    await expect(within(bottomCard).getByText('OFF')).toBeVisible();
  }
}`,...g.parameters?.docs?.source},description:{story:`Shows a paired setup where selecting one card unselects the other.
The top card is always enabled; the bottom card can be enabled via its switch.`,...g.parameters?.docs?.description}}};const Re=["Default","SwitchStory","Static","Interaction"];export{T as Default,g as Interaction,B as Static,A as SwitchStory,Re as __namedExportsOrder,Fe as default};

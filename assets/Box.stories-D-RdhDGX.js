import{j as t}from"./iframe-CGUFCU7f.js";import{d as B,c as y,b as T,A as j}from"./index-BoMshO7v.js";import{A as b}from"./index-u3z_k5JR.js";import{S as f}from"./index-GQyngMHC.js";import{B as i,a,b as s}from"./index-CleBzkog.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-DCYm8U2k.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./index-CVrXcT1N.js";import"./index-B8k91cqS.js";import"./useRenderElement-BQbCiycg.js";import"./index-BlnDAJH2.js";import"./useControlled-Kh7KOzPI.js";import"./useButton-DcZoe7g1.js";import"./visuallyHidden-COI6QeQH.js";import"./useBaseUiId-BP1KBVDm.js";import"./useValueChanged-CPtaE3-O.js";import"./index-B7o473QB.js";import"./index-CuCU4ywu.js";import"./useLabelableId-C1-TlTgd.js";import"./index-DcccOjoR.js";import"./useRender-5o01eIur.js";const{expect:e,userEvent:g,waitFor:u,within:w}=__STORYBOOK_MODULE_TEST__,G={title:"Components/Box",component:s,tags:["wip"],subcomponents:{BoxTitle:a,BoxContent:i},argTypes:{className:{control:"text",description:"Additional tailwind classes to apply to the container"}},render:n=>t.jsxs(s,{...n,children:[t.jsx(a,{children:"Title"}),t.jsx(i,{children:t.jsx("p",{className:"text-base text-muted-foreground",children:"Content goes here"})})]}),decorators:[n=>t.jsx("div",{style:{minWidth:"600px",margin:"0 auto"},children:t.jsx(n,{})})],parameters:{docs:{description:{component:`A simple container component that can be used to group related content together.
It can optionally include a switch to toggle the visibility of the content.`}}}},l={},d={render:()=>t.jsx(s,{children:t.jsx(a,{children:"Title only"})})},h={render:()=>t.jsx(s,{children:t.jsx(i,{children:t.jsx("p",{className:"text-base text-muted-foreground",children:"Content without a title"})})})},p={render:()=>t.jsxs(s,{hasSwitch:!0,children:[t.jsx(a,{children:"With switch"}),t.jsx(i,{children:t.jsx("p",{className:"text-base text-muted-foreground",children:"This content is toggled by the switch."})})]}),play:async({canvasElement:n})=>{const r=w(n),o=r.getByRole("switch",{name:/With switch/i}),c=r.getByText("This content is toggled by the switch.");await e(o).not.toBeChecked(),await e(c).not.toBeVisible(),await g.click(o),await e(o).toBeChecked(),await u(()=>e(c).toBeVisible()),await g.click(o),await e(o).not.toBeChecked(),await u(()=>e(c).not.toBeVisible())}},m={render:()=>t.jsxs(s,{hasSwitch:!0,defaultOpen:!0,children:[t.jsx(a,{children:"Default open switch"}),t.jsx(i,{children:t.jsx("p",{className:"text-base text-muted-foreground",children:"This content is toggled by the switch."})})]}),play:async({canvasElement:n})=>{const r=w(n),o=r.getByRole("switch",{name:/Default open switch/i}),c=r.getByText("This content is toggled by the switch.");await e(o).toBeChecked(),await e(c).toBeVisible()}},x={render:()=>t.jsxs(s,{children:[t.jsx(a,{children:"Rich content"}),t.jsx(f,{}),t.jsx(i,{children:t.jsxs(B,{children:[t.jsx(b,{}),t.jsx(y,{children:t.jsx(T,{children:"Some info"})}),t.jsx(j,{children:"Here is some additional information."})]})})]})};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:"{}",...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Box>
      <BoxTitle>{'Title only'}</BoxTitle>
    </Box>
}`,...d.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Box>
      <BoxContent>
        <p className={'text-base text-muted-foreground'}>
          {'Content without a title'}
        </p>
      </BoxContent>
    </Box>
}`,...h.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Box hasSwitch>
      <BoxTitle>{'With switch'}</BoxTitle>
      <BoxContent>
        <p className={'text-base text-muted-foreground'}>
          {'This content is toggled by the switch.'}
        </p>
      </BoxContent>
    </Box>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', {
      name: /With switch/i
    });
    const content = canvas.getByText('This content is toggled by the switch.');
    await expect(toggle).not.toBeChecked();
    await expect(content).not.toBeVisible();
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
    await waitFor(() => expect(content).toBeVisible());
    await userEvent.click(toggle);
    await expect(toggle).not.toBeChecked();
    await waitFor(() => expect(content).not.toBeVisible());
  }
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Box hasSwitch defaultOpen>
      <BoxTitle>{'Default open switch'}</BoxTitle>
      <BoxContent>
        <p className={'text-base text-muted-foreground'}>
          {'This content is toggled by the switch.'}
        </p>
      </BoxContent>
    </Box>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', {
      name: /Default open switch/i
    });
    const content = canvas.getByText('This content is toggled by the switch.');
    await expect(toggle).toBeChecked();
    await expect(content).toBeVisible();
  }
}`,...m.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Box>
      <BoxTitle>{'Rich content'}</BoxTitle>
      <Separator />
      <BoxContent>
        <Alert>
          <AlertStatus />
          <AlertHeader>
            <AlertTitle>{'Some info'}</AlertTitle>
          </AlertHeader>
          <AlertDescription>
            {'Here is some additional information.'}
          </AlertDescription>
        </Alert>
      </BoxContent>
    </Box>
}`,...x.parameters?.docs?.source}}};const J=["Default","TitleOnly","ContentOnly","WithSwitch","WithSwitchDefaultOpen","WithRichContent"];export{h as ContentOnly,l as Default,d as TitleOnly,x as WithRichContent,p as WithSwitch,m as WithSwitchDefaultOpen,J as __namedExportsOrder,G as default};

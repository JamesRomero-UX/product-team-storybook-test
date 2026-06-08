import{j as t}from"./iframe-CGUFCU7f.js";import{c as i}from"./utils-DCYm8U2k.js";import{S as s,s as p}from"./index-BlnDAJH2.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./index-B8k91cqS.js";import"./useControlled-Kh7KOzPI.js";import"./useButton-DcZoe7g1.js";import"./useRenderElement-BQbCiycg.js";import"./visuallyHidden-COI6QeQH.js";import"./useBaseUiId-BP1KBVDm.js";import"./useValueChanged-CPtaE3-O.js";import"./index-B7o473QB.js";import"./index-CuCU4ywu.js";import"./useLabelableId-C1-TlTgd.js";const{expect:c,userEvent:h,within:u}=__STORYBOOK_MODULE_TEST__,T={title:"Components/Switch",component:s,argTypes:{className:{control:"text",description:"Additional tailwind classes to apply to the switch"},size:{control:"select",options:Object.keys(p),description:"The size of the switch"},disabled:{control:"boolean",description:"Whether the switch is disabled"},checked:{control:"boolean",description:"Whether the switch is checked"},defaultChecked:{control:"boolean",description:"The default checked state (uncontrolled)"}},parameters:{docs:{description:{component:"A toggle switch component for binary options"}}}},n={args:{defaultChecked:!0,"aria-label":"Toggle option"},render:e=>t.jsx(s,{...e}),play:async({canvasElement:e})=>{const a=u(e).getByRole("switch",{name:/Toggle option/i});await c(a).toHaveAttribute("aria-checked","true"),await h.click(a),await c(a).toHaveAttribute("aria-checked","false"),await h.click(a),await c(a).toHaveAttribute("aria-checked","true")}},r={render:()=>t.jsx("div",{className:i("story-tile-group"),children:Object.keys(p).map(e=>t.jsxs("div",{className:i("story-tile"),children:[t.jsx(s,{size:e,defaultChecked:!0,"aria-label":`Toggle ${e} size`}),t.jsx("span",{className:"text-base text-center text-foreground",children:e})]},e))})},o={render:()=>t.jsxs("div",{className:i("story-tile-group"),children:[t.jsx("div",{className:i("story-tile"),children:t.jsx(s,{disabled:!0,defaultChecked:!1,"aria-label":"Disabled unchecked"})}),t.jsx("div",{className:i("story-tile"),children:t.jsx(s,{disabled:!0,defaultChecked:!0,"aria-label":"Disabled checked"})})]}),play:async({canvasElement:e})=>{const l=u(e),a=l.getByRole("switch",{name:/Disabled unchecked/i}),d=l.getByRole("switch",{name:/Disabled checked/i});await c(a).toHaveAttribute("aria-disabled","true"),await c(d).toHaveAttribute("aria-disabled","true"),await c(a).toHaveAttribute("aria-checked","false"),await c(d).toHaveAttribute("aria-checked","true")}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    defaultChecked: true,
    'aria-label': 'Toggle option'
  },
  render: args => <Switch {...args} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', {
      name: /Toggle option/i
    });

    // Should start checked
    await expect(toggle).toHaveAttribute('aria-checked', 'true');

    // Click to uncheck
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    // Click to check again
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  }
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div className={cn('story-tile-group')}>
      {Object.keys(size).map(key => <div key={key} className={cn('story-tile')}>
          <Switch size={key as keyof typeof size} defaultChecked aria-label={\`Toggle \${key} size\`} />
          <span className={'text-base text-center text-foreground'}>{key}</span>
        </div>)}
    </div>
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className={cn('story-tile-group')}>
      <div className={cn('story-tile')}>
        <Switch disabled defaultChecked={false} aria-label={'Disabled unchecked'} />
      </div>
      <div className={cn('story-tile')}>
        <Switch disabled defaultChecked aria-label={'Disabled checked'} />
      </div>
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const unchecked = canvas.getByRole('switch', {
      name: /Disabled unchecked/i
    });
    const checked = canvas.getByRole('switch', {
      name: /Disabled checked/i
    });
    await expect(unchecked).toHaveAttribute('aria-disabled', 'true');
    await expect(checked).toHaveAttribute('aria-disabled', 'true');
    await expect(unchecked).toHaveAttribute('aria-checked', 'false');
    await expect(checked).toHaveAttribute('aria-checked', 'true');
  }
}`,...o.parameters?.docs?.source}}};const z=["Default","Sizes","Disabled"];export{n as Default,o as Disabled,r as Sizes,z as __namedExportsOrder,T as default};

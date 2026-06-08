import{j as a}from"./iframe-BUnym78j.js";import{c as d}from"./utils-DCYm8U2k.js";import{I as l}from"./index-Bs1e9xXM.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";const{expect:n,userEvent:v,within:u}=__STORYBOOK_MODULE_TEST__,h={title:"Components/Input",component:l,tags:["wip"],argTypes:{type:{control:"select",options:["text"],description:"The HTML input type"},placeholder:{control:"text",description:"Placeholder text shown when the input is empty"},disabled:{control:"boolean",description:"Whether the input is disabled"},value:{control:"text",description:"Controlled value"}},args:{type:"text",placeholder:"Placeholder text"},decorators:[e=>a.jsx("div",{style:{minWidth:"300px",margin:"0 auto"},children:a.jsx(e,{})})],parameters:{docs:{description:{component:"A basic text input primitive. Supports all native `<input>` attributes."}}}},r={play:async({canvasElement:e})=>{const t=u(e).getByPlaceholderText("Placeholder text");await n(t).toBeInTheDocument(),await n(t).toHaveValue(""),await v.click(t),await v.type(t,"Hello world"),await n(t).toHaveValue("Hello world")}},o={render:e=>a.jsxs("div",{className:d("flex flex-col gap-4"),children:[a.jsx(l,{...e}),a.jsx(l,{...e,defaultValue:"Input value"})]})},c={render:e=>a.jsxs("div",{className:d("flex flex-col gap-4"),children:[a.jsx(l,{...e,disabled:!0,"aria-label":"Disabled empty"}),a.jsx(l,{...e,disabled:!0,defaultValue:"Input value","aria-label":"Disabled with value"})]}),play:async({canvasElement:e})=>{const i=u(e),t=i.getByRole("textbox",{name:/Disabled empty/i}),s=i.getByRole("textbox",{name:/Disabled with value/i});await n(t).toBeDisabled(),await n(s).toBeDisabled(),await n(s).toHaveValue("Input value")}},p={render:e=>a.jsxs("div",{className:d("flex flex-col gap-4"),children:[a.jsx(l,{...e,"aria-invalid":!0,"aria-label":"Invalid empty"}),a.jsx(l,{...e,"aria-invalid":!0,defaultValue:"Input value","aria-label":"Invalid with value"})]}),play:async({canvasElement:e})=>{const i=u(e),t=i.getByRole("textbox",{name:/Invalid empty/i}),s=i.getByRole("textbox",{name:/Invalid with value/i});await n(t).toHaveAttribute("aria-invalid","true"),await n(s).toHaveAttribute("aria-invalid","true")}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Placeholder text');
    await expect(input).toBeInTheDocument();
    await expect(input).toHaveValue('');

    // Type into the input
    await userEvent.click(input);
    await userEvent.type(input, 'Hello world');
    await expect(input).toHaveValue('Hello world');
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: args => <div className={cn('flex flex-col gap-4')}>
      <Input {...args} />
      <Input {...args} defaultValue={'Input value'} />
    </div>
}`,...o.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: args => <div className={cn('flex flex-col gap-4')}>
      <Input {...args} disabled aria-label={'Disabled empty'} />
      <Input {...args} disabled defaultValue={'Input value'} aria-label={'Disabled with value'} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const emptyInput = canvas.getByRole('textbox', {
      name: /Disabled empty/i
    });
    const filledInput = canvas.getByRole('textbox', {
      name: /Disabled with value/i
    });
    await expect(emptyInput).toBeDisabled();
    await expect(filledInput).toBeDisabled();
    await expect(filledInput).toHaveValue('Input value');
  }
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => <div className={cn('flex flex-col gap-4')}>
      <Input {...args} aria-invalid={true} aria-label={'Invalid empty'} />
      <Input {...args} aria-invalid={true} defaultValue={'Input value'} aria-label={'Invalid with value'} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const emptyInput = canvas.getByRole('textbox', {
      name: /Invalid empty/i
    });
    const filledInput = canvas.getByRole('textbox', {
      name: /Invalid with value/i
    });
    await expect(emptyInput).toHaveAttribute('aria-invalid', 'true');
    await expect(filledInput).toHaveAttribute('aria-invalid', 'true');
  }
}`,...p.parameters?.docs?.source}}};const f=["Default","Standard","Disabled","Invalid"];export{r as Default,c as Disabled,p as Invalid,o as Standard,f as __namedExportsOrder,h as default};

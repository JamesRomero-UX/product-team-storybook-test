import{j as t}from"./iframe-BUnym78j.js";import{c}from"./utils-DCYm8U2k.js";import{S as s}from"./index-DGeIQDaT.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./useRenderElement-Ca5MjKVy.js";const{expect:r,within:i}=__STORYBOOK_MODULE_TEST__,h={title:"Components/Separator",component:s,argTypes:{className:{control:"text",description:"Additional tailwind classes to apply to the separator"},orientation:{control:"select",options:["horizontal","vertical"],description:"The orientation of the separator"}},args:{orientation:"horizontal"},parameters:{docs:{description:{component:`A visual divider used to separate content. Supports horizontal and vertical
orientations.`}}}},n={render:e=>t.jsxs("div",{className:c("flex flex-col gap-4 w-[400px]"),children:[t.jsx("p",{className:"text-sm text-foreground",children:"Content above"}),t.jsx(s,{...e}),t.jsx("p",{className:"text-sm text-foreground",children:"Content below"})]}),play:async({canvasElement:e})=>{const a=i(e).getByRole("separator");await r(a).toBeInTheDocument(),await r(a).toHaveAttribute("data-orientation","horizontal")}},o={args:{orientation:"vertical"},render:e=>t.jsxs("div",{className:c("flex items-center gap-4 h-[40px]"),children:[t.jsx("span",{className:"text-sm text-foreground",children:"Left"}),t.jsx(s,{...e}),t.jsx("span",{className:"text-sm text-foreground",children:"Right"})]}),play:async({canvasElement:e})=>{const a=i(e).getByRole("separator");await r(a).toBeInTheDocument(),await r(a).toHaveAttribute("data-orientation","vertical")}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: args => <div className={cn('flex flex-col gap-4 w-[400px]')}>
      <p className={'text-sm text-foreground'}>{'Content above'}</p>
      <Separator {...args} />
      <p className={'text-sm text-foreground'}>{'Content below'}</p>
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const separator = canvas.getByRole('separator');
    await expect(separator).toBeInTheDocument();
    await expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  },
  render: args => <div className={cn('flex items-center gap-4 h-[40px]')}>
      <span className={'text-sm text-foreground'}>{'Left'}</span>
      <Separator {...args} />
      <span className={'text-sm text-foreground'}>{'Right'}</span>
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const separator = canvas.getByRole('separator');
    await expect(separator).toBeInTheDocument();
    await expect(separator).toHaveAttribute('data-orientation', 'vertical');
  }
}`,...o.parameters?.docs?.source}}};const f=["Horizontal","Vertical"];export{n as Horizontal,o as Vertical,f as __namedExportsOrder,h as default};

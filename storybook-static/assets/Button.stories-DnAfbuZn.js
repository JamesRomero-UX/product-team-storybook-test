import{j as e}from"./iframe-CGUFCU7f.js";import{c as n,t as x}from"./utils-DCYm8U2k.js";import{I as r}from"./index-CVrXcT1N.js";import{B as t,v as c,s as g,a as j,r as b}from"./index-DYvux3PE.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./index-B8k91cqS.js";import"./useButton-DcZoe7g1.js";import"./useRenderElement-BQbCiycg.js";const{expect:N,within:f}=__STORYBOOK_MODULE_TEST__,_={title:"Components/Button",component:t,argTypes:{className:{control:"text",description:"Additional tailwind classes to apply to the button"},variant:{control:"select",options:Object.keys(c),description:"The pre-configured button style to apply"},style:{control:"select",options:Object.keys(g),description:"The visual style of the button"},radius:{control:"select",options:Object.keys(b),description:"The border radius of the button"},size:{control:"select",options:Object.keys(j),description:"The size of the button"},onClick:{action:"clicked",description:"Callback fired when the button is clicked"},disabled:{control:"boolean",description:"Whether the button is disabled"},elevated:{control:"boolean",description:"Whether the button scales up and shows a shadow on hover"},children:{options:["Text","Leading icon","Trailing icon","Icon only"],mapping:{Text:"Button","Leading icon":e.jsxs(e.Fragment,{children:[e.jsx(r,{name:"plus"})," ","Button"]}),"Trailing icon":e.jsxs(e.Fragment,{children:["Button ",e.jsx(r,{name:"chevron-down"})]}),"Icon only":e.jsx(r,{name:"plus"})},control:"select",description:"The content of the button"}},args:{variant:"default",style:"default",radius:"full",size:"md",children:"Text"},parameters:{docs:{description:{component:"A button is a clickable element used to perform an action or trigger an event"}}}},l={},d={render:s=>e.jsx("div",{className:n("story-tile-group"),children:Object.keys(c).map(a=>e.jsx("div",{className:n("story-tile"),children:e.jsx(t,{...s,variant:a,children:x(a)})},a))})},m={render:s=>e.jsx("div",{className:n("flex flex-col gap-6"),children:Object.keys(g).map(a=>e.jsx("div",{children:e.jsx("div",{className:n("story-tile-group"),children:Object.keys(c).map(o=>e.jsx("div",{className:n("story-tile"),children:e.jsx(t,{...s,variant:o,style:a,children:x(o)})},o))})},a))})},u={render:s=>e.jsxs("div",{className:n("story-tile-group items-center"),children:[e.jsx(t,{...s,size:"sm",children:"Small"}),e.jsx(t,{...s,size:"md",children:"Medium"})]})},p={render:s=>e.jsxs("div",{className:n("story-tile-group"),children:[e.jsx(t,{...s,radius:"full",children:"Full"}),e.jsx(t,{...s,radius:"xl",children:"XL"})]})},v={render:s=>e.jsx("div",{className:n("story-tile-group"),children:Object.keys(c).map(a=>e.jsx("div",{className:n("story-tile"),children:e.jsx(t,{...s,variant:a,disabled:!0,children:x(a)})},a))}),play:async({canvasElement:s})=>{const o=f(s).getByRole("button",{name:/Default/i});await N(o).toBeDisabled()}},y={render:s=>e.jsxs("div",{className:n("story-tile-group"),children:[e.jsxs(t,{...s,children:[e.jsx(r,{name:"plus"})," ","Leading icon"]}),e.jsxs(t,{...s,children:["Trailing icon",e.jsx(r,{name:"chevron-down"})]}),e.jsxs(t,{...s,children:[e.jsx(r,{name:"plus"})," ","Both icons",e.jsx(r,{name:"chevron-down"})]})]})},i={render:s=>e.jsx("div",{className:n("flex flex-col gap-6"),children:Object.keys(g).map(a=>e.jsx("div",{children:e.jsx("div",{className:n("story-tile-group"),children:Object.keys(c).map(o=>e.jsx("div",{className:n("story-tile"),children:e.jsx(t,{...s,variant:o,style:a,size:"icon","aria-label":`${o} ${a}`,children:e.jsx(r,{name:"plus"})})},o))})},a))})},h={render:s=>e.jsxs("div",{className:n("flex gap-4"),children:[e.jsx("div",{className:"w-[300px]",children:e.jsxs(t,{...s,style:"dashed",radius:"xl",elevated:!0,className:"border-secondary bg-secondary-minimal h-[60px] w-full",children:[e.jsx(r,{name:"plus"}),"Add likelihood"]})}),e.jsx(t,{...s,variant:"destructive",style:"outline",radius:"xl",className:"h-[60px]",children:e.jsx(r,{name:"trash-01"})})]})};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:"{}",...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => <div className={cn('story-tile-group')}>
      {Object.keys(variant).map(variantName => <div key={variantName} className={cn('story-tile')}>
          <Button {...args} variant={variantName as keyof typeof variant}>
            {toTitleCase(variantName)}
          </Button>
        </div>)}
    </div>
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => <div className={cn('flex flex-col gap-6')}>
      {Object.keys(style).map(styleName => <div key={styleName}>
          <div className={cn('story-tile-group')}>
            {Object.keys(variant).map(variantName => <div key={variantName} className={cn('story-tile')}>
                <Button {...args} variant={variantName as keyof typeof variant} style={styleName as keyof typeof style}>
                  {toTitleCase(variantName)}
                </Button>
              </div>)}
          </div>
        </div>)}
    </div>
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: args => <div className={cn('story-tile-group items-center')}>
      <Button {...args} size={'sm'}>
        {'Small'}
      </Button>
      <Button {...args} size={'md'}>
        {'Medium'}
      </Button>
    </div>
}`,...u.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => <div className={cn('story-tile-group')}>
      <Button {...args} radius={'full'}>
        {'Full'}
      </Button>
      <Button {...args} radius={'xl'}>
        {'XL'}
      </Button>
    </div>
}`,...p.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => <div className={cn('story-tile-group')}>
      {Object.keys(variant).map(variantName => <div key={variantName} className={cn('story-tile')}>
          <Button {...args} variant={variantName as keyof typeof variant} disabled>
            {toTitleCase(variantName)}
          </Button>
        </div>)}
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', {
      name: /Default/i
    });
    await expect(button).toBeDisabled();
  }
}`,...v.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => <div className={cn('story-tile-group')}>
      <Button {...args}>
        <Icon name={'plus'} /> {'Leading icon'}
      </Button>
      <Button {...args}>
        {'Trailing icon'}
        <Icon name={'chevron-down'} />
      </Button>
      <Button {...args}>
        <Icon name={'plus'} /> {'Both icons'}
        <Icon name={'chevron-down'} />
      </Button>
    </div>
}`,...y.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: args => <div className={cn('flex flex-col gap-6')}>
      {Object.keys(style).map(styleName => <div key={styleName}>
          <div className={cn('story-tile-group')}>
            {Object.keys(variant).map(variantName => <div key={variantName} className={cn('story-tile')}>
                <Button {...args} variant={variantName as keyof typeof variant} style={styleName as keyof typeof style} size={'icon'} aria-label={\`\${variantName} \${styleName}\`}>
                  <Icon name={'plus'} />
                </Button>
              </div>)}
          </div>
        </div>)}
    </div>
}`,...i.parameters?.docs?.source},description:{story:"Icon-only buttons — provide an `aria-label` for accessibility",...i.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => <div className={cn('flex gap-4')}>
      <div className={'w-[300px]'}>
        <Button {...args} style={'dashed'} radius={'xl'} elevated className={'border-secondary bg-secondary-minimal h-[60px] w-full'}>
          <Icon name={'plus'} />
          {'Add likelihood'}
        </Button>
      </div>
      <Button {...args} variant={'destructive'} style={'outline'} radius={'xl'} className={'h-[60px]'}>
        <Icon name={'trash-01'} />
      </Button>
    </div>
}`,...h.parameters?.docs?.source}}};const L=["Default","Variants","Styles","Sizes","Radius","Disabled","Icons","IconOnly","Custom"];export{h as Custom,l as Default,v as Disabled,i as IconOnly,y as Icons,p as Radius,u as Sizes,m as Styles,d as Variants,L as __namedExportsOrder,_ as default};

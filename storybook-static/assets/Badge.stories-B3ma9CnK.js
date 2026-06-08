import{j as a}from"./iframe-BUnym78j.js";import{t,c as d}from"./utils-DCYm8U2k.js";import{I as c}from"./index-DAsga1CA.js";import{B as n,v as p}from"./index-CBziSGNp.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./index-B8k91cqS.js";import"./useRender-C6qmYnVs.js";import"./useRenderElement-Ca5MjKVy.js";const r=Object.keys(p),i=["secondary","success","warning","destructive","neutral"],z={title:"Components/Badge",component:n,argTypes:{className:{control:"text",description:"Additional tailwind classes to apply to the badge"},variant:{control:"select",options:Object.keys(p),description:"The pre-configured badge style to apply"},size:{control:"select",options:["sm","md"],description:"The size of the badge"},border:{control:"boolean",description:"Whether to apply a border style to the badge"},children:{control:"text",description:"The content of the badge"}},args:{children:"Success",variant:"success",size:"md",border:!1},parameters:{docs:{description:{component:"Displays a badge or a component that looks like a badge"}}}},o={},m={render:s=>a.jsxs("div",{className:d("grid grid-cols-7 justify-items-start gap-4"),children:[a.jsx("span",{className:"col-span-7 font-medium",children:"Default"}),r.map(e=>a.jsx(n,{...s,variant:e,size:"md",border:!1,children:t(e)},e)),a.jsx("span",{className:"col-span-7 font-medium mt-8",children:"Default with Icon"}),r.map(e=>a.jsxs(n,{...s,variant:e,size:"md",border:!1,children:[t(e),a.jsx(c,{name:"activity",size:"xs"})]},e)),a.jsx("span",{className:"col-span-7 font-medium mt-8",children:"Small"}),r.map(e=>a.jsx(n,{...s,variant:e,size:"sm",border:!1,children:t(e)},e)),a.jsx("span",{className:"col-span-7 font-medium mt-8",children:"Small with Icon"}),r.map(e=>a.jsxs(n,{...s,variant:e,size:"sm",border:!1,children:[t(e),a.jsx(c,{name:"activity",size:"xs"})]},e))]})},l={render:s=>a.jsxs("div",{className:d("grid grid-cols-4 justify-items-start gap-4"),children:[a.jsx("span",{className:"col-span-4 font-medium",children:"Default"}),i.map(e=>a.jsx(n,{...s,variant:e,size:"md",border:!0,children:t(e)},e)),a.jsx("span",{className:"col-span-4 font-medium mt-8",children:"Default with Icon"}),i.map(e=>a.jsxs(n,{...s,variant:e,size:"md",border:!0,children:[t(e),a.jsx(c,{name:"activity",size:"xs"})]},e)),a.jsx("span",{className:"col-span-4 font-medium mt-8",children:"Small"}),i.map(e=>a.jsx(n,{...s,variant:e,size:"sm",border:!0,children:t(e)},e)),a.jsx("span",{className:"col-span-4 font-medium mt-8",children:"Small with Icon"}),i.map(e=>a.jsxs(n,{...s,variant:e,size:"sm",border:!0,children:[t(e),a.jsx(c,{name:"activity",size:"xs"})]},e))]})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"{}",...o.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => <div className={cn('grid grid-cols-7 justify-items-start gap-4')}>
      <span className={'col-span-7 font-medium'}>{'Default'}</span>
      {allVariants.map(key => <Badge key={key} {...args} variant={key} size={'md'} border={false}>
          {toTitleCase(key)}
        </Badge>)}
      <span className={'col-span-7 font-medium mt-8'}>
        {'Default with Icon'}
      </span>
      {allVariants.map(key => <Badge key={key} {...args} variant={key} size={'md'} border={false}>
          {toTitleCase(key)}
          <IconComponent name={'activity'} size={'xs'} />
        </Badge>)}
      <span className={'col-span-7 font-medium mt-8'}>{'Small'}</span>
      {allVariants.map(key => <Badge key={key} {...args} variant={key} size={'sm'} border={false}>
          {toTitleCase(key)}
        </Badge>)}
      <span className={'col-span-7 font-medium mt-8'}>{'Small with Icon'}</span>
      {allVariants.map(key => <Badge key={key} {...args} variant={key} size={'sm'} border={false}>
          {toTitleCase(key)}
          <IconComponent name={'activity'} size={'xs'} />
        </Badge>)}
    </div>
}`,...m.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: args => <div className={cn('grid grid-cols-4 justify-items-start gap-4')}>
      <span className={'col-span-4 font-medium'}>{'Default'}</span>
      {borderVariants.map(key => <Badge key={key} {...args} variant={key} size={'md'} border={true}>
          {toTitleCase(key)}
        </Badge>)}
      <span className={'col-span-4 font-medium mt-8'}>
        {'Default with Icon'}
      </span>
      {borderVariants.map(key => <Badge key={key} {...args} variant={key} size={'md'} border={true}>
          {toTitleCase(key)}
          <IconComponent name={'activity'} size={'xs'} />
        </Badge>)}
      <span className={'col-span-4 font-medium mt-8'}>{'Small'}</span>
      {borderVariants.map(key => <Badge key={key} {...args} variant={key} size={'sm'} border={true}>
          {toTitleCase(key)}
        </Badge>)}
      <span className={'col-span-4 font-medium mt-8'}>{'Small with Icon'}</span>
      {borderVariants.map(key => <Badge key={key} {...args} variant={key} size={'sm'} border={true}>
          {toTitleCase(key)}
          <IconComponent name={'activity'} size={'xs'} />
        </Badge>)}
    </div>
}`,...l.parameters?.docs?.source}}};const B=["Default","Flat","Border"];export{l as Border,o as Default,m as Flat,B as __namedExportsOrder,z as default};

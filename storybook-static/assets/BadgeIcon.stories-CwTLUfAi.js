import{j as e}from"./iframe-CGUFCU7f.js";import{c as o}from"./utils-DCYm8U2k.js";import{c}from"./index-CVrXcT1N.js";import{B as r,v as n}from"./index-D_36kx6Z.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./index-B8k91cqS.js";const y={title:"Components/BadgeIcon",component:r,argTypes:{variant:{control:"select",options:Object.keys(n),description:"The variant of the check badge"},icon:{control:"select",options:c,description:"A custom icon to display in the badge. This will override the preconfigured icon for the chosen variant."},className:{control:"text",description:"Additional tailwind classes to apply to the check badge"}},args:{variant:"success"},parameters:{docs:{description:{component:"A small badge component that displays an icon. The icon is a configured preset based on the variant or can be given a specific icon by passing an icon name."}}}},t={},a={render:()=>e.jsx("div",{className:o("story-tile-group"),children:Object.keys(n).map(s=>e.jsxs("div",{className:o("story-tile"),children:[e.jsx(r,{variant:s}),e.jsx("span",{className:"text-base text-center text-muted-foreground",children:s})]},s))})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className={cn('story-tile-group')}>
      {Object.keys(variant).map(key => <div key={key} className={cn('story-tile')}>
          <BadgeIcon variant={key as keyof typeof variant} />
          <span className={'text-base text-center text-muted-foreground'}>
            {key}
          </span>
        </div>)}
    </div>
}`,...a.parameters?.docs?.source}}};const f=["Default","Variants"];export{t as Default,a as Variants,f as __namedExportsOrder,y as default};

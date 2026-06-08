import{j as t}from"./iframe-CGUFCU7f.js";import{c as r}from"./utils-DCYm8U2k.js";import{A as o,v as n}from"./index-u3z_k5JR.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./index-B8k91cqS.js";const v={title:"Components/AlertStatus",component:o,argTypes:{className:{control:"text",description:"Additional tailwind classes to apply to the alert status"},variant:{control:"select",options:Object.keys(n),description:"The variant of the alert status"}},args:{variant:"active"}},e={},a={render:()=>t.jsx("div",{className:r("story-tile-group"),children:Object.keys(n).map(s=>t.jsxs("div",{className:r("story-tile"),children:[t.jsx(o,{variant:s}),t.jsx("span",{className:"text-base text-center text-muted-foreground",children:s})]},s))})};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className={cn('story-tile-group')}>
      {Object.keys(variant).map(key => <div key={key} className={cn('story-tile')}>
          <AlertStatus variant={key as keyof typeof variant} />
          <span className={'text-base text-center text-muted-foreground'}>
            {key}
          </span>
        </div>)}
    </div>
}`,...a.parameters?.docs?.source}}};const x=["Default","Variants"];export{e as Default,a as Variants,x as __namedExportsOrder,v as default};

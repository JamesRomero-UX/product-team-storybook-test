import{j as e}from"./iframe-BUnym78j.js";import{c as o}from"./utils-DCYm8U2k.js";import{S as n,s as a}from"./index-EvlZhN_f.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./index-B8k91cqS.js";const x={title:"Components/Spinner",component:n,tags:["wip"],argTypes:{className:{control:"text",description:"Additional tailwind classes to apply to the spinner"},size:{control:"select",options:Object.keys(a),description:"The size of the spinner"}},parameters:{docs:{description:{component:"A spinner indicates that content is loading"}}}},s={},t={render:()=>e.jsx("div",{className:o("story-tile-group"),children:Object.keys(a).map(r=>e.jsxs("div",{className:o("story-tile"),children:[e.jsx(n,{size:r}),e.jsx("span",{className:"text-base text-center text-muted-foreground",children:r})]},r))})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <div className={cn('story-tile-group')}>
      {Object.keys(size).map(key => <div key={key} className={cn('story-tile')}>
          <Spinner size={key as keyof typeof size} />
          <span className={'text-base text-center text-muted-foreground'}>
            {key}
          </span>
        </div>)}
    </div>
}`,...t.parameters?.docs?.source}}};const y=["Default","Sizes"];export{s as Default,t as Sizes,y as __namedExportsOrder,x as default};

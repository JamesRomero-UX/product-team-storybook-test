import{j as e}from"./iframe-CGUFCU7f.js";import{c as m}from"./utils-DCYm8U2k.js";import{c as d,I as c,s as o,v as p}from"./index-CVrXcT1N.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./index-B8k91cqS.js";const v={title:"Components/Icon",component:c,argTypes:{name:{control:"select",options:d,description:"The icon SVG to use"},variant:{control:"select",options:Object.keys(p),description:"The pre-configured icon style to apply"},size:{control:"select",options:Object.keys(o),description:"The size of the icon"}},args:{name:"activity",variant:"primary",size:"md"},parameters:{docs:{description:{component:"An SVG icon component to display various icons"}}}},n={args:{name:"activity"}},a={args:{...n.args},render:({name:r})=>e.jsx("div",{className:m("flex gap-[48px]"),children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{className:"text-base font-medium text-muted-foreground text-right p-2"}),Object.keys(o).map(t=>e.jsx("th",{className:"text-base font-medium text-muted-foreground text-center p-2",children:t},t))]})}),e.jsx("tbody",{children:Object.keys(p).map(t=>e.jsxs("tr",{children:[e.jsx("td",{className:"text-base font-medium text-muted-foreground text-left p-2",children:t}),Object.keys(o).map(i=>e.jsx("td",{className:"text-center p-2",children:e.jsx(c,{name:r,variant:t,size:i})},i))]},t))})]})})},s={render:({...r})=>e.jsx("div",{className:m("grid grid-cols-6 gap-12"),children:d.map(t=>e.jsxs("div",{className:"flex flex-col items-center gap-4",children:[e.jsx(c,{...r,name:t}),e.jsx("div",{className:"text-base text-center text-foreground",children:t})]}))})};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'activity'
  }
}`,...n.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  render: ({
    name
  }) => <div className={cn('flex gap-[48px]')}>
      <table>
        <thead>
          <tr>
            <th className={'text-base font-medium text-muted-foreground text-right p-2'} />
            {Object.keys(size).map(sizeName => <th key={sizeName} className={'text-base font-medium text-muted-foreground text-center p-2'}>
                {sizeName}
              </th>)}
          </tr>
        </thead>
        <tbody>
          {Object.keys(variant).map(variantName => <tr key={variantName}>
              <td className={'text-base font-medium text-muted-foreground text-left p-2'}>
                {variantName}
              </td>
              {Object.keys(size).map(sizeName => <td key={sizeName} className={'text-center p-2'}>
                  <Icon name={name} variant={variantName as keyof typeof variant} size={sizeName as keyof typeof size} />
                </td>)}
            </tr>)}
        </tbody>
      </table>
    </div>
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: ({
    ...args
  }) => <div className={cn('grid grid-cols-6 gap-12')}>
      {commonIcons.map(iconName => <div className={'flex flex-col items-center gap-4'}>
          <Icon {...args} name={iconName as IconName} />
          <div className={'text-base text-center text-foreground'}>
            {iconName}
          </div>
        </div>)}
    </div>
}`,...s.parameters?.docs?.source},description:{story:"A story to display a selection of commonly used icons in the design system, along with their corresponding names for easy reference when selecting icons for use in designs or development.",...s.parameters?.docs?.description}}};const j=["Default","Variants","CommonIcons"];export{s as CommonIcons,n as Default,a as Variants,j as __namedExportsOrder,v as default};

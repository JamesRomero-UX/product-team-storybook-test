import{j as e}from"./iframe-CGUFCU7f.js";import{c as v}from"./utils-DCYm8U2k.js";import{A as c}from"./index-u3z_k5JR.js";import{A as d,a as p,b as n,c as l,d as o,e as h,v as m}from"./index-BoMshO7v.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./index-B8k91cqS.js";import"./index-CVrXcT1N.js";const k={title:"Components/Alert",component:o,subcomponents:{AlertStatus:c,AlertHeader:l,AlertTitle:n,AlertSubtitle:p,AlertDescription:d},argTypes:{variant:{control:"select",options:Object.keys(m),description:"The variant of the alert"}},args:{variant:"active"},render:r=>e.jsxs(o,{variant:r.variant,children:[e.jsx(c,{variant:r.variant}),e.jsxs(l,{children:[e.jsx(n,{children:"This is an alert title"}),e.jsx(p,{children:"This is an alert subtitle"})]}),e.jsx(d,{children:"This is an alert description"})]}),decorators:[r=>e.jsx("div",{style:{minWidth:"600px",margin:"0 auto"},children:e.jsx(r,{})})]},a={},s={render:()=>{const r=Object.keys(m);return e.jsx("div",{className:v("grid gap-4"),children:r.map(t=>e.jsxs(o,{variant:t,children:[e.jsx(c,{variant:t}),e.jsxs(l,{children:[e.jsx(n,{children:"This is an alert title"}),e.jsx(p,{children:"This is an alert subtitle"})]}),e.jsx(d,{children:"This is an alert description"})]},t))})}},i={render:()=>{const r=Object.keys(m);return e.jsx("div",{className:v("grid gap-4"),children:r.map(t=>e.jsxs(o,{variant:t,size:"sm",children:[e.jsx(h,{}),e.jsx(l,{children:e.jsx(n,{children:"This is an alert title"})})]},t))})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:"{}",...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => {
    const variants = Object.keys(variant) as (keyof typeof variant)[];
    return <div className={cn('grid gap-4')}>
        {variants.map(key => <Alert key={key} variant={key}>
            <AlertStatus variant={key} />
            <AlertHeader>
              <AlertTitle>{'This is an alert title'}</AlertTitle>
              <AlertSubtitle>{'This is an alert subtitle'}</AlertSubtitle>
            </AlertHeader>
            <AlertDescription>
              {'This is an alert description'}
            </AlertDescription>
          </Alert>)}
      </div>;
  }
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => {
    const variants = Object.keys(variant) as (keyof typeof variant)[];
    return <div className={cn('grid gap-4')}>
        {variants.map(key => <Alert key={key} variant={key} size={'sm'}>
            <AlertInfo />
            <AlertHeader>
              <AlertTitle>{'This is an alert title'}</AlertTitle>
            </AlertHeader>
          </Alert>)}
      </div>;
  }
}`,...i.parameters?.docs?.source}}};const S=["Default","Variants","Small"];export{a as Default,i as Small,s as Variants,S as __namedExportsOrder,k as default};

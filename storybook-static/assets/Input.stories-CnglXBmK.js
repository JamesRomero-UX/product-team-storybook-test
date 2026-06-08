import{j as e,r as m}from"./iframe-BUnym78j.js";import{I as l}from"./index-BS7YkbFR.js";import{S as s}from"./index-CET-t2Ia.js";/* empty css              */import"./preload-helper-PPVm8Dsz.js";import"./apply-display-name-CKHUfYBo.js";import"./clsx-B-dksMZM.js";import"./internal-CK4HeV83.js";import"./internal-DTQb2lEl.js";import"./context-DgI7pV8n.js";import"./internal-CS48Lg7j.js";import"./index-C_OfJrUg.js";import"./logging-Do9SP7zB.js";import"./use-funnel-CyztZGaS.js";import"./node-belongs-DM3X8Ciw.js";import"./find-up-until-BRKS-4M1.js";import"./selectors-CqP7R3Su.js";import"./single-tab-stop-navigation-context-CiOjkB8Q.js";import"./index-KL8ugYfO.js";import"./index-DWTVc6zx.js";import"./index-2OBVZBGs.js";import"./internal-C154RwbQ.js";import"./modal-context-Dao2yP6v.js";import"./check-safe-url-CtPM6X1I.js";import"./internal-DAJpLwfg.js";import"./attributes-BsWGnux6.js";import"./utils-DGIBRVIo.js";import"./keycode-CVkmaVHg.js";import"./scrollable-containers-Di3KpToI.js";import"./index-Cjedr7LG.js";import"./index-BrQu0-NH.js";import"./use-resize-observer-CCSf-OCQ.js";import"./index-BB8hD4a8.js";import"./Transition-w2PxoBaW.js";import"./form-field-context-CKiKvs_Y.js";import"./index-BDOWj98w.js";import"./debounce-6Bmtvcts.js";import"./utils-6vMGLzgc.js";import"./internal-Ct41rtnD.js";import"./index-CZ8g2pRB.js";const Z={title:"Cloudscape Reference/Input",component:l,tags:["cloudscape-real"],parameters:{layout:"centered",docs:{description:{component:"Real Cloudscape Input rendered with RiskSmart theme. 1:1 with live app."}}}},r=t=>{const[i,d]=m.useState("");return e.jsx(l,{value:i,onChange:({detail:n})=>d(n.value),placeholder:t.placeholder,type:t.type,disabled:t.disabled,invalid:t.invalid})},o={render:()=>e.jsx(r,{placeholder:"Type here"})},a={render:()=>e.jsxs(s,{size:"s",children:[e.jsx(r,{placeholder:"Text",type:"text"}),e.jsx(r,{placeholder:"Search",type:"search"}),e.jsx(r,{placeholder:"Email",type:"email"}),e.jsx(r,{placeholder:"Number",type:"number"}),e.jsx(r,{placeholder:"Password",type:"password"})]})},p={render:()=>e.jsxs(s,{size:"s",children:[e.jsx(r,{placeholder:"Default"}),e.jsx(r,{placeholder:"Disabled",disabled:!0}),e.jsx(r,{placeholder:"Invalid",invalid:!0})]})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <Controlled placeholder={'Type here'} />
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <SpaceBetween size={'s'}>
      <Controlled placeholder={'Text'} type={'text'} />
      <Controlled placeholder={'Search'} type={'search'} />
      <Controlled placeholder={'Email'} type={'email'} />
      <Controlled placeholder={'Number'} type={'number'} />
      <Controlled placeholder={'Password'} type={'password'} />
    </SpaceBetween>
}`,...a.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <SpaceBetween size={'s'}>
      <Controlled placeholder={'Default'} />
      <Controlled placeholder={'Disabled'} disabled />
      <Controlled placeholder={'Invalid'} invalid />
    </SpaceBetween>
}`,...p.parameters?.docs?.source}}};const $=["Default","Types","States"];export{o as Default,p as States,a as Types,$ as __namedExportsOrder,Z as default};

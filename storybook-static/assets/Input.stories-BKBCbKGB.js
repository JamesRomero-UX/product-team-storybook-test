import{j as e,r as m}from"./iframe-CGUFCU7f.js";import{I as l}from"./index-r8qr9JOI.js";import{S as s}from"./index-CJSDoaqF.js";/* empty css              */import"./preload-helper-PPVm8Dsz.js";import"./apply-display-name-BLkmUqWr.js";import"./clsx-B-dksMZM.js";import"./internal-CuRpKUYu.js";import"./internal-B-JwIsuO.js";import"./context-D8tPZRIA.js";import"./internal-D4iCGoaF.js";import"./index-ChVYcNbT.js";import"./logging-Do9SP7zB.js";import"./use-funnel-AbMDah8x.js";import"./node-belongs-WtzSDwnj.js";import"./find-up-until-BRKS-4M1.js";import"./selectors-CqP7R3Su.js";import"./single-tab-stop-navigation-context-DKkbNJRw.js";import"./index-KL8ugYfO.js";import"./index-DqesKSp7.js";import"./index-cNOLf2x0.js";import"./internal-DjZrncL4.js";import"./modal-context-6lCMvgDJ.js";import"./check-safe-url-CtPM6X1I.js";import"./internal-ja8OVsdD.js";import"./attributes-BsWGnux6.js";import"./utils-DGIBRVIo.js";import"./keycode-CVkmaVHg.js";import"./scrollable-containers-adW6Dse0.js";import"./index-B7o473QB.js";import"./index-CuCU4ywu.js";import"./use-resize-observer-3Gfl0AxN.js";import"./index-Czpqf29M.js";import"./Transition-CjMv9etq.js";import"./form-field-context-BW9QsZp8.js";import"./index-CYkxabPI.js";import"./debounce-6Bmtvcts.js";import"./utils-DbHqjU1J.js";import"./internal-Dsnmrf4x.js";import"./index-Msco8KEF.js";const Z={title:"Cloudscape Reference/Input",component:l,tags:["cloudscape-real"],parameters:{layout:"centered",docs:{description:{component:"Real Cloudscape Input rendered with RiskSmart theme. 1:1 with live app."}}}},r=t=>{const[i,d]=m.useState("");return e.jsx(l,{value:i,onChange:({detail:n})=>d(n.value),placeholder:t.placeholder,type:t.type,disabled:t.disabled,invalid:t.invalid})},o={render:()=>e.jsx(r,{placeholder:"Type here"})},a={render:()=>e.jsxs(s,{size:"s",children:[e.jsx(r,{placeholder:"Text",type:"text"}),e.jsx(r,{placeholder:"Search",type:"search"}),e.jsx(r,{placeholder:"Email",type:"email"}),e.jsx(r,{placeholder:"Number",type:"number"}),e.jsx(r,{placeholder:"Password",type:"password"})]})},p={render:()=>e.jsxs(s,{size:"s",children:[e.jsx(r,{placeholder:"Default"}),e.jsx(r,{placeholder:"Disabled",disabled:!0}),e.jsx(r,{placeholder:"Invalid",invalid:!0})]})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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

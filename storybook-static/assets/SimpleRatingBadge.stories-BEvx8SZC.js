import{j as e}from"./iframe-BUnym78j.js";import{S as r}from"./SimpleRatingBadge-gdxz6ifp.js";/* empty css              */import"./preload-helper-PPVm8Dsz.js";import"./colours-fy-5mFzv.js";import"./index-Ciqn2WuZ.js";import"./utils-CR4HQEcg.js";import"./htmlEntityDecoder-CkdV-qxi.js";import"./toPropertyKey-BRA8pAMC.js";import"./typeof-QjJsDpFa.js";import"./index-BX5rs4Nt.js";import"./lodash-Dzeova8C.js";const B={title:"Cloudscape Reference/SimpleRatingBadge",component:r,tags:["cloudscape-real"],parameters:{layout:"centered",docs:{description:{component:"Real RiskSmart SimpleRatingBadge. 1:1 with live app."}}}},l=({children:s})=>e.jsx("div",{style:{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",maxWidth:720},children:s}),a={render:()=>e.jsxs(l,{children:[e.jsx(r,{rating:{color:"dark-green",label:"Very Low"}}),e.jsx(r,{rating:{color:"light-green",label:"Low"}}),e.jsx(r,{rating:{color:"orange",label:"Medium"}}),e.jsx(r,{rating:{color:"light-red",label:"High"}}),e.jsx(r,{rating:{color:"dark-red",label:"Critical"}})]})},n={render:()=>e.jsxs(l,{children:[e.jsx(r,{rating:{color:"darker-green",label:"Open"}}),e.jsx(r,{rating:{color:"orange",label:"In review"}}),e.jsx(r,{rating:{color:"light-grey",label:"Mitigated"}}),e.jsx(r,{rating:{color:"strong-red",label:"Breach"}}),e.jsx(r,{rating:{color:"blue-500",label:"On track"}})]})},o={render:()=>e.jsx(r,{rating:{color:"dark-red",label:"Critical",tooltip:"Hover to see this tooltip — useful for explaining the rating"}})},t={render:()=>e.jsx(r,{rating:{label:"Unrated"}})},i={render:()=>e.jsx(r,{rating:{color:"ai-assistant",label:"ignored"},children:e.jsx("strong",{children:"Custom content"})})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <Row>
      <SimpleRatingBadge rating={{
      color: 'dark-green',
      label: 'Very Low'
    }} />
      <SimpleRatingBadge rating={{
      color: 'light-green',
      label: 'Low'
    }} />
      <SimpleRatingBadge rating={{
      color: 'orange',
      label: 'Medium'
    }} />
      <SimpleRatingBadge rating={{
      color: 'light-red',
      label: 'High'
    }} />
      <SimpleRatingBadge rating={{
      color: 'dark-red',
      label: 'Critical'
    }} />
    </Row>
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <Row>
      <SimpleRatingBadge rating={{
      color: 'darker-green',
      label: 'Open'
    }} />
      <SimpleRatingBadge rating={{
      color: 'orange',
      label: 'In review'
    }} />
      <SimpleRatingBadge rating={{
      color: 'light-grey',
      label: 'Mitigated'
    }} />
      <SimpleRatingBadge rating={{
      color: 'strong-red',
      label: 'Breach'
    }} />
      <SimpleRatingBadge rating={{
      color: 'blue-500',
      label: 'On track'
    }} />
    </Row>
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <SimpleRatingBadge rating={{
    color: 'dark-red',
    label: 'Critical',
    tooltip: 'Hover to see this tooltip — useful for explaining the rating'
  }} />
}`,...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <SimpleRatingBadge rating={{
    label: 'Unrated'
  }} />
}`,...t.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <SimpleRatingBadge rating={{
    color: 'ai-assistant',
    label: 'ignored'
  }}>
      <strong>Custom content</strong>
    </SimpleRatingBadge>
}`,...i.parameters?.docs?.source}}};const w=["SeverityScale","StatusVariants","WithTooltip","NoColor","CustomChildren"];export{i as CustomChildren,t as NoColor,a as SeverityScale,n as StatusVariants,o as WithTooltip,w as __namedExportsOrder,B as default};

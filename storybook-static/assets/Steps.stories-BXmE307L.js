import{b as e,j as _}from"./iframe-BUnym78j.js";import{_ as u,h as g,u as b,a as h}from"./apply-display-name-CKHUfYBo.js";import{g as y}from"./external-props-BxzNJ8Rq.js";import{c as f}from"./clsx-B-dksMZM.js";import{S as x}from"./internal-1-1x6dHk.js";/* empty css              */import"./preload-helper-PPVm8Dsz.js";import"./internal-CS48Lg7j.js";import"./index-C_OfJrUg.js";import"./logging-Do9SP7zB.js";import"./internal-C154RwbQ.js";import"./modal-context-Dao2yP6v.js";const r={root:"awsui_root_gxp9y_1c0ju_181",list:"awsui_list_gxp9y_1c0ju_212",container:"awsui_container_gxp9y_1c0ju_217",header:"awsui_header_gxp9y_1c0ju_222",details:"awsui_details_gxp9y_1c0ju_226",connector:"awsui_connector_gxp9y_1c0ju_232"},R=({status:s,statusIconAriaLabel:n,header:a,details:t})=>e.createElement("li",{className:r.container},e.createElement("div",{className:r.header},e.createElement(x,{type:s,iconAriaLabel:n},a)),e.createElement("hr",{className:r.connector,role:"none"}),t&&e.createElement("div",{className:r.details},t)),E=s=>{var{steps:n,ariaLabel:a,ariaLabelledby:t,ariaDescribedby:c,__internalRootRef:l}=s,d=u(s,["steps","ariaLabel","ariaLabelledby","ariaDescribedby","__internalRootRef"]);return e.createElement("div",Object.assign({},d,{className:f(r.root,d.className),ref:l}),e.createElement("ol",{className:r.list,"aria-label":a,"aria-labelledby":t,"aria-describedby":c},n.map((o,m)=>e.createElement(R,{key:m,status:o.status,statusIconAriaLabel:o.statusIconAriaLabel,header:o.header,details:o.details}))))},p=s=>{var{steps:n}=s,a=u(s,["steps"]);const t=g(a),c=b("Steps"),l=y(a);return e.createElement(E,Object.assign({},t,c,l,{steps:n}))};h(p,"Steps");const O={title:"Cloudscape Reference/Steps",component:p,tags:["cloudscape-real"],parameters:{layout:"fullscreen",docs:{description:{component:"Real Cloudscape Steps rendered with RiskSmart theme. 1:1 with live app."}}}},i={render:()=>_.jsx(p,{steps:[{status:"success",header:"Validated input",details:"All checks passed."},{status:"success",header:"Created resource",details:"Resource ARN: …"},{status:"in-progress",header:"Configuring permissions"},{status:"loading",header:"Pending",details:"Waiting on dependency."}]})};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <Steps steps={[{
    status: 'success',
    header: 'Validated input',
    details: 'All checks passed.'
  }, {
    status: 'success',
    header: 'Created resource',
    details: 'Resource ARN: …'
  }, {
    status: 'in-progress',
    header: 'Configuring permissions'
  }, {
    status: 'loading',
    header: 'Pending',
    details: 'Waiting on dependency.'
  }]} />
}`,...i.parameters?.docs?.source}}};const B=["Default"];export{i as Default,B as __namedExportsOrder,O as default};

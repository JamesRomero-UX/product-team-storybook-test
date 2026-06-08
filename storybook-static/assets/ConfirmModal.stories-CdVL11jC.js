import{j as e,r as l}from"./iframe-CGUFCU7f.js";import{C as p}from"./ConfirmModal-z4XvJ-Gt.js";import{B as u}from"./Button-BNUAMf31.js";/* empty css              */import{R as h}from"./_providers-BPXkn1NX.js";import"./preload-helper-PPVm8Dsz.js";import"./index-CEigGvsg.js";import"./apply-display-name-BLkmUqWr.js";import"./internal-D5O6mRBm.js";import"./clsx-B-dksMZM.js";import"./index-r3cLacq9.js";import"./analytics-funnel-Dtqo7GzI.js";import"./index-CYkxabPI.js";import"./debounce-6Bmtvcts.js";import"./index-cNOLf2x0.js";import"./node-belongs-WtzSDwnj.js";import"./find-up-until-BRKS-4M1.js";import"./use-funnel-AbMDah8x.js";import"./selectors-CqP7R3Su.js";import"./index-CsOBNtUa.js";import"./internal-C_XUL6zD.js";import"./internal-B-JwIsuO.js";import"./context-D8tPZRIA.js";import"./internal-D4iCGoaF.js";import"./index-ChVYcNbT.js";import"./logging-Do9SP7zB.js";import"./single-tab-stop-navigation-context-DKkbNJRw.js";import"./index-KL8ugYfO.js";import"./index-DqesKSp7.js";import"./internal-DjZrncL4.js";import"./modal-context-6lCMvgDJ.js";import"./check-safe-url-CtPM6X1I.js";import"./internal-ja8OVsdD.js";import"./attributes-BsWGnux6.js";import"./utils-DGIBRVIo.js";import"./keycode-CVkmaVHg.js";import"./scrollable-containers-adW6Dse0.js";import"./index-B7o473QB.js";import"./index-CuCU4ywu.js";import"./use-resize-observer-3Gfl0AxN.js";import"./index-Czpqf29M.js";import"./Transition-CjMv9etq.js";import"./internal-CyIiHfHo.js";import"./use-sticky-header-BEWAZ61L.js";import"./tokens-g9UmuoXE.js";import"./index-gSq0ga6q.js";import"./breakpoints-ClyhurDb.js";import"./collection-label-context-CXga71YR.js";import"./info-link-label-context-D9djZTh3.js";import"./styles.css-e2nXqERc.js";import"./reset-contexts-for-modal-Cj_BOhyU.js";import"./form-field-context-BW9QsZp8.js";import"./link-default-variant-context-BHofIwVa.js";import"./browser-scrollbar-size-McRLht8o.js";import"./use-container-breakpoints-Urty4INF.js";import"./use-container-query-C3XLhfLK.js";import"./index-CJSDoaqF.js";import"./internal-Dsnmrf4x.js";import"./index-Msco8KEF.js";import"./htmlEntityDecoder-wSt2bSSJ.js";import"./useTranslation-DNxvs7Ew.js";import"./index-C_HPrsPu.js";import"./index-p_HiXphI.js";import"./chunk-EPOLDU6W-DP44Pv5b.js";import"./routes.utils-BNc48AXW.js";const ke={title:"Cloudscape Reference/ConfirmModal",component:p,tags:["cloudscape-real"],parameters:{layout:"centered",docs:{description:{component:"Real RiskSmart ConfirmModal. 1:1 with live app."}}}},s=({children:i})=>e.jsx(h,{initialPath:"/",children:e.jsx("div",{style:{padding:24},children:i})}),n=({defaultOpen:i=!1,header:m,body:d})=>{const[c,a]=l.useState(i);return e.jsxs(e.Fragment,{children:[e.jsx(u,{onClick:()=>a(!0),children:"Open confirm modal"}),e.jsx(p,{isVisible:c,onConfirm:()=>a(!1),onDismiss:()=>a(!1),header:m,children:d})]})},r={render:()=>e.jsx(s,{children:e.jsx(n,{defaultOpen:!0,header:"Submit assessment",body:"Submit this assessment for review? Once submitted, it will be queued for the next QA pass."})})},t={render:()=>e.jsx(s,{children:e.jsx(n,{defaultOpen:!0,header:"Discard changes?",body:"You have unsaved changes. If you leave this page now, your edits will be lost."})})},o={render:()=>e.jsx(s,{children:e.jsx(n,{defaultOpen:!0,header:"Confirm bulk update",body:`This action will update 47 risks at once.

The following changes will be applied to every selected risk:

• Severity → Critical
• Status → In review
• Owner → Sarah Chen

Each affected risk will receive an entry in its activity log. Linked controls and ratings remain unchanged. You can review the updates from the dashboard once they're complete.`})})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <Wrap>
      <StateHarness defaultOpen header={'Submit assessment'} body={'Submit this assessment for review? Once submitted, it will be queued for the next QA pass.'} />
    </Wrap>
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <Wrap>
      <StateHarness defaultOpen header={'Discard changes?'} body={'You have unsaved changes. If you leave this page now, your edits will be lost.'} />
    </Wrap>
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <Wrap>
      <StateHarness defaultOpen header={'Confirm bulk update'} body={\`This action will update 47 risks at once.

The following changes will be applied to every selected risk:

• Severity → Critical
• Status → In review
• Owner → Sarah Chen

Each affected risk will receive an entry in its activity log. Linked controls and ratings remain unchanged. You can review the updates from the dashboard once they're complete.\`} />
    </Wrap>
}`,...o.parameters?.docs?.source}}};const We=["Default","DiscardChangesPattern","WithLongContent"];export{r as Default,t as DiscardChangesPattern,o as WithLongContent,We as __namedExportsOrder,ke as default};

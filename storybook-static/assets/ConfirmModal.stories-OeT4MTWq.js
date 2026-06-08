import{j as e,r as l}from"./iframe-BUnym78j.js";import{C as p}from"./ConfirmModal-BpZooirE.js";import{B as u}from"./Button-yPPdSgVq.js";/* empty css              */import{R as h}from"./_providers-DGWFJzUf.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DEptbsjU.js";import"./apply-display-name-CKHUfYBo.js";import"./internal-CN2lIOd4.js";import"./clsx-B-dksMZM.js";import"./index-BMEstytV.js";import"./analytics-funnel-B2mVtqDm.js";import"./index-BDOWj98w.js";import"./debounce-6Bmtvcts.js";import"./index-2OBVZBGs.js";import"./node-belongs-DM3X8Ciw.js";import"./find-up-until-BRKS-4M1.js";import"./use-funnel-CyztZGaS.js";import"./selectors-CqP7R3Su.js";import"./index-CsOBNtUa.js";import"./internal-DTQb2lEl.js";import"./context-DgI7pV8n.js";import"./internal-CS48Lg7j.js";import"./index-C_OfJrUg.js";import"./logging-Do9SP7zB.js";import"./single-tab-stop-navigation-context-CiOjkB8Q.js";import"./index-KL8ugYfO.js";import"./index-DWTVc6zx.js";import"./internal-C154RwbQ.js";import"./modal-context-Dao2yP6v.js";import"./check-safe-url-CtPM6X1I.js";import"./internal-DAJpLwfg.js";import"./attributes-BsWGnux6.js";import"./utils-DGIBRVIo.js";import"./keycode-CVkmaVHg.js";import"./scrollable-containers-Di3KpToI.js";import"./index-Cjedr7LG.js";import"./index-BrQu0-NH.js";import"./use-resize-observer-CCSf-OCQ.js";import"./index-BB8hD4a8.js";import"./Transition-w2PxoBaW.js";import"./internal-CWLtv37n.js";import"./use-sticky-header-CuRt6Hnw.js";import"./tokens-g9UmuoXE.js";import"./index-BZgvQFWB.js";import"./breakpoints-ClyhurDb.js";import"./collection-label-context-BZ8hit9G.js";import"./info-link-label-context-D4Pepnu7.js";import"./styles.css-e2nXqERc.js";import"./reset-contexts-for-modal-DXkpDuD2.js";import"./form-field-context-CKiKvs_Y.js";import"./link-default-variant-context-B3_QY-cQ.js";import"./browser-scrollbar-size-CnjVAKlV.js";import"./use-container-breakpoints-Co36Y5p2.js";import"./use-container-query-JgEnex8Q.js";import"./index-CET-t2Ia.js";import"./internal-Ct41rtnD.js";import"./index-CZ8g2pRB.js";import"./htmlEntityDecoder-CkdV-qxi.js";import"./useTranslation-Brgt5L2G.js";import"./index-BX5rs4Nt.js";import"./index-CJSIJNQI.js";import"./chunk-EPOLDU6W-Os_zj8jW.js";import"./routes.utils-BNc48AXW.js";const Oe={title:"Cloudscape Reference/ConfirmModal",component:p,tags:["cloudscape-real"],parameters:{layout:"centered",docs:{description:{component:"Real RiskSmart ConfirmModal. 1:1 with live app."}}}},s=({children:i})=>e.jsx(h,{initialPath:"/",children:e.jsx("div",{style:{padding:24},children:i})}),n=({defaultOpen:i=!1,header:m,body:d})=>{const[c,a]=l.useState(i);return e.jsxs(e.Fragment,{children:[e.jsx(u,{onClick:()=>a(!0),children:"Open confirm modal"}),e.jsx(p,{isVisible:c,onConfirm:()=>a(!1),onDismiss:()=>a(!1),header:m,children:d})]})},r={render:()=>e.jsx(s,{children:e.jsx(n,{defaultOpen:!0,header:"Submit assessment",body:"Submit this assessment for review? Once submitted, it will be queued for the next QA pass."})})},t={render:()=>e.jsx(s,{children:e.jsx(n,{defaultOpen:!0,header:"Discard changes?",body:"You have unsaved changes. If you leave this page now, your edits will be lost."})})},o={render:()=>e.jsx(s,{children:e.jsx(n,{defaultOpen:!0,header:"Confirm bulk update",body:`This action will update 47 risks at once.

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
}`,...o.parameters?.docs?.source}}};const ke=["Default","DiscardChangesPattern","WithLongContent"];export{r as Default,t as DiscardChangesPattern,o as WithLongContent,ke as __namedExportsOrder,Oe as default};

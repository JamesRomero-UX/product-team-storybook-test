import{j as r}from"./iframe-CGUFCU7f.js";import{L as e}from"./Link-DzlJt_aF.js";/* empty css              */import{R as p}from"./_providers-BPXkn1NX.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DMCOx19i.js";import"./apply-display-name-BLkmUqWr.js";import"./internal-CV7ydK0b.js";import"./clsx-B-dksMZM.js";import"./context-D8tPZRIA.js";import"./internal-D4iCGoaF.js";import"./index-ChVYcNbT.js";import"./logging-Do9SP7zB.js";import"./use-funnel-AbMDah8x.js";import"./node-belongs-WtzSDwnj.js";import"./find-up-until-BRKS-4M1.js";import"./selectors-CqP7R3Su.js";import"./info-link-label-context-D9djZTh3.js";import"./link-default-variant-context-BHofIwVa.js";import"./single-tab-stop-navigation-context-DKkbNJRw.js";import"./index-KL8ugYfO.js";import"./index-DqesKSp7.js";import"./index-cNOLf2x0.js";import"./index-CkmEnIMw.js";import"./keycode-CVkmaVHg.js";import"./check-safe-url-CtPM6X1I.js";import"./attributes-BsWGnux6.js";import"./use-link-BA5aeiFa.js";import"./chunk-EPOLDU6W-DP44Pv5b.js";import"./routes.utils-BNc48AXW.js";import"./htmlEntityDecoder-wSt2bSSJ.js";import"./index-C_HPrsPu.js";const n=({children:o})=>r.jsx(p,{initialPath:"/risks",children:r.jsx("div",{style:{padding:24,display:"flex",flexDirection:"column",gap:12,alignItems:"flex-start"},children:o})}),B={title:"Cloudscape Reference/Link (web)",component:e,tags:["cloudscape-real"],parameters:{layout:"centered",docs:{description:{component:"Real RiskSmart web Link wrapper. 1:1 with live app. Delegates to react-router for internal hrefs and adds optional `isRelativeUrl` mode that prepends the current pathname."}}}},t={render:()=>r.jsxs(n,{children:[r.jsx(e,{href:"/risks",children:"Go to risks register"}),r.jsx(e,{href:"/risks/R-001",children:"Risk R-001"}),r.jsx(e,{href:"/dashboard",children:"Dashboard"})]})},i={render:()=>r.jsxs(n,{children:[r.jsx(e,{href:"https://risksmart.com",external:!0,children:"risksmart.com (external)"}),r.jsx(e,{href:"https://docs.risksmart.com",external:!0,children:"Documentation (external)"})]})},a={render:()=>r.jsx(n,{children:r.jsx(e,{href:"edit",isRelativeUrl:!0,children:"Edit (resolves relative to current path)"})})},s={render:()=>r.jsxs(n,{children:[r.jsx(e,{href:"/",children:"default"}),r.jsx(e,{href:"/",variant:"primary",children:"primary"}),r.jsx(e,{href:"/",variant:"info",children:"info"})]})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <Wrap>
      <Link href={'/risks'}>Go to risks register</Link>
      <Link href={'/risks/R-001'}>Risk R-001</Link>
      <Link href={'/dashboard'}>Dashboard</Link>
    </Wrap>
}`,...t.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <Wrap>
      <Link href={'https://risksmart.com'} external>
        risksmart.com (external)
      </Link>
      <Link href={'https://docs.risksmart.com'} external>
        Documentation (external)
      </Link>
    </Wrap>
}`,...i.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <Wrap>
      <Link href={'edit'} isRelativeUrl>
        Edit (resolves relative to current path)
      </Link>
    </Wrap>
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <Wrap>
      <Link href={'/'}>default</Link>
      <Link href={'/'} variant={'primary'}>primary</Link>
      <Link href={'/'} variant={'info'}>info</Link>
    </Wrap>
}`,...s.parameters?.docs?.source}}};const F=["Internal","External","RelativeUrl","Variants"];export{i as External,t as Internal,a as RelativeUrl,s as Variants,F as __namedExportsOrder,B as default};

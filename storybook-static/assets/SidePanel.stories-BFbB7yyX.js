import{j as e,r as f}from"./iframe-BUnym78j.js";import{B as d}from"./index-DEptbsjU.js";import{F as x}from"./index-DNFH6ia7.js";import{H as S}from"./index-BNnjXpiH.js";import{I as v}from"./index-BS7YkbFR.js";import{S as p}from"./index-CET-t2Ia.js";import{T as j}from"./index-CGqERyFk.js";import{B as l}from"./Button-yPPdSgVq.js";import{u as m}from"./useSidePanelStore-_FCd5tET.js";import{c as y}from"./clsx-B-dksMZM.js";/* empty css              */import{R as b}from"./_providers-DGWFJzUf.js";import"./preload-helper-PPVm8Dsz.js";import"./apply-display-name-CKHUfYBo.js";import"./internal-CN2lIOd4.js";import"./internal-BDLeOcsx.js";import"./internal-2bDGHVAz.js";import"./index-CZ8g2pRB.js";import"./breakpoints-ClyhurDb.js";import"./index-C_OfJrUg.js";import"./use-container-breakpoints-Co36Y5p2.js";import"./use-container-query-JgEnex8Q.js";import"./use-resize-observer-CCSf-OCQ.js";import"./index-Cjedr7LG.js";import"./index-BrQu0-NH.js";import"./logging-Do9SP7zB.js";import"./context-DgI7pV8n.js";import"./internal-CS48Lg7j.js";import"./index-CsOBNtUa.js";import"./use-funnel-CyztZGaS.js";import"./node-belongs-DM3X8Ciw.js";import"./find-up-until-BRKS-4M1.js";import"./selectors-CqP7R3Su.js";import"./form-field-context-CKiKvs_Y.js";import"./info-link-label-context-D4Pepnu7.js";import"./index-2OBVZBGs.js";import"./internal-DAJpLwfg.js";import"./join-strings-B_VxFHfG.js";import"./attributes-BsWGnux6.js";import"./internal-CWLtv37n.js";import"./use-sticky-header-CuRt6Hnw.js";import"./tokens-g9UmuoXE.js";import"./index-BZgvQFWB.js";import"./scrollable-containers-Di3KpToI.js";import"./collection-label-context-BZ8hit9G.js";import"./styles.css-e2nXqERc.js";import"./internal-CK4HeV83.js";import"./internal-DTQb2lEl.js";import"./single-tab-stop-navigation-context-CiOjkB8Q.js";import"./index-KL8ugYfO.js";import"./index-DWTVc6zx.js";import"./internal-C154RwbQ.js";import"./modal-context-Dao2yP6v.js";import"./check-safe-url-CtPM6X1I.js";import"./utils-DGIBRVIo.js";import"./keycode-CVkmaVHg.js";import"./index-BB8hD4a8.js";import"./Transition-w2PxoBaW.js";import"./index-BDOWj98w.js";import"./debounce-6Bmtvcts.js";import"./utils-6vMGLzgc.js";import"./internal-Ct41rtnD.js";import"./index-CJSIJNQI.js";import"./chunk-EPOLDU6W-Os_zj8jW.js";import"./routes.utils-BNc48AXW.js";import"./react-BDbfsZLH.js";import"./htmlEntityDecoder-CkdV-qxi.js";import"./index-BX5rs4Nt.js";const g=()=>{const{content:r}=m();return r||null},w="_sidePanelContainer_15u2c_1",B={sidePanelContainer:w},c=({header:r,content:t})=>e.jsxs("div",{className:y("grid grid-rows-[fit-content(2rem)_auto] h-full bg-white font-[Sora,sans-serif] text-sm",B.sidePanelContainer),children:[r,t]});c.__docgenInfo={description:"",methods:[],displayName:"SidePanelContainer",props:{header:{required:!0,tsType:{name:"ReactNode"},description:""},content:{required:!0,tsType:{name:"ReactNode"},description:""}}};const Ae={title:"Cloudscape Reference/SidePanel",component:g,tags:["cloudscape-real"],parameters:{layout:"fullscreen",docs:{description:{component:"Real RiskSmart SidePanel + SidePanelContainer. 1:1 with live app. The drawer chrome is driven by useSidePanelStore — call `open(key, content, ...)` to populate."}}}},h=({open:r=!1,panel:t})=>{const u=m(s=>s.open),a=m(s=>s.close);return f.useEffect(()=>(r&&t?u("chat",t,!1,!1):a(),()=>a()),[r,t,u,a]),e.jsx(b,{initialPath:"/risks/R-001",children:e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 360px",height:600,gap:16,padding:16,background:"#f9f9fd"},children:[e.jsxs("div",{style:{background:"#fff",padding:24,borderRadius:12,border:"1px solid #e5e5e5"},children:[e.jsx(S,{children:"Risk details"}),e.jsx(d,{children:"This is the main page content. The SidePanel renders to the right when content is pushed into the store."})]}),e.jsx("div",{style:{background:"#fff",borderRadius:12,border:"1px solid #e5e5e5",overflow:"hidden"},children:e.jsx(g,{})})]})})},o={render:()=>e.jsx(h,{open:!1})},i={render:()=>e.jsx(h,{open:!0,panel:e.jsx(c,{header:e.jsx("div",{style:{padding:"16px 20px",borderBottom:"1px solid #e9ebed",fontWeight:600},children:"Notes for R-001"}),content:e.jsx("div",{style:{padding:20},children:e.jsxs(p,{size:"m",children:[e.jsx(d,{children:'This panel slides in from the right when the user clicks "Notes" or any drawer-trigger action on the page.'}),e.jsx(d,{variant:"small",children:"Try resizing the window — the panel chrome adapts."}),e.jsx(l,{children:"Add a note"})]})})})})},n={render:()=>e.jsx(h,{open:!0,panel:e.jsx(c,{header:e.jsx("div",{style:{padding:"16px 20px",borderBottom:"1px solid #e9ebed",fontWeight:600},children:"Edit risk"}),content:e.jsx("div",{style:{padding:20},children:e.jsxs(p,{size:"l",children:[e.jsx(x,{label:"Title",children:e.jsx(v,{value:"Data breach via legacy S3 bucket",onChange:()=>{}})}),e.jsx(x,{label:"Description",children:e.jsx(j,{value:"Unrestricted S3 bucket containing legacy customer data was discovered during quarterly audit.",onChange:()=>{},rows:4})}),e.jsxs(p,{size:"xs",direction:"horizontal",children:[e.jsx(l,{children:"Cancel"}),e.jsx(l,{variant:"primary",children:"Save"})]})]})})})})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <PanelStage open={false} />
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <PanelStage open panel={<SidePanelContainer header={<div style={{
    padding: '16px 20px',
    borderBottom: '1px solid #e9ebed',
    fontWeight: 600
  }}>
              Notes for R-001
            </div>} content={<div style={{
    padding: 20
  }}>
              <SpaceBetween size={'m'}>
                <Box>This panel slides in from the right when the user clicks "Notes" or any drawer-trigger action on the page.</Box>
                <Box variant={'small'}>Try resizing the window — the panel chrome adapts.</Box>
                <Button>Add a note</Button>
              </SpaceBetween>
            </div>} />} />
}`,...i.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <PanelStage open panel={<SidePanelContainer header={<div style={{
    padding: '16px 20px',
    borderBottom: '1px solid #e9ebed',
    fontWeight: 600
  }}>
              Edit risk
            </div>} content={<div style={{
    padding: 20
  }}>
              <SpaceBetween size={'l'}>
                <FormField label={'Title'}>
                  <Input value={'Data breach via legacy S3 bucket'} onChange={() => {}} />
                </FormField>
                <FormField label={'Description'}>
                  <Textarea value={'Unrestricted S3 bucket containing legacy customer data was discovered during quarterly audit.'} onChange={() => {}} rows={4} />
                </FormField>
                <SpaceBetween size={'xs'} direction={'horizontal'}>
                  <Button>Cancel</Button>
                  <Button variant={'primary'}>Save</Button>
                </SpaceBetween>
              </SpaceBetween>
            </div>} />} />
}`,...n.parameters?.docs?.source}}};const He=["Closed","Open","WithForm"];export{o as Closed,i as Open,n as WithForm,He as __namedExportsOrder,Ae as default};

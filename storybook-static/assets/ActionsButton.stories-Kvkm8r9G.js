import{j as e}from"./iframe-BUnym78j.js";import{A as o}from"./ActionsButton-AkUsNTUg.js";/* empty css              */import{R as a}from"./_providers-DGWFJzUf.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DJLR7FHM.js";import"./apply-display-name-CKHUfYBo.js";import"./internal-C1eXd3CH.js";import"./clsx-B-dksMZM.js";import"./internal-CN2lIOd4.js";import"./internal-DTQb2lEl.js";import"./context-DgI7pV8n.js";import"./internal-CS48Lg7j.js";import"./index-C_OfJrUg.js";import"./logging-Do9SP7zB.js";import"./use-funnel-CyztZGaS.js";import"./node-belongs-DM3X8Ciw.js";import"./find-up-until-BRKS-4M1.js";import"./selectors-CqP7R3Su.js";import"./single-tab-stop-navigation-context-CiOjkB8Q.js";import"./index-KL8ugYfO.js";import"./index-DWTVc6zx.js";import"./index-2OBVZBGs.js";import"./internal-C154RwbQ.js";import"./modal-context-Dao2yP6v.js";import"./check-safe-url-CtPM6X1I.js";import"./internal-DAJpLwfg.js";import"./attributes-BsWGnux6.js";import"./utils-DGIBRVIo.js";import"./keycode-CVkmaVHg.js";import"./scrollable-containers-Di3KpToI.js";import"./index-Cjedr7LG.js";import"./index-BrQu0-NH.js";import"./use-resize-observer-CCSf-OCQ.js";import"./index-BB8hD4a8.js";import"./Transition-w2PxoBaW.js";import"./index-_52J92kN.js";import"./index-CRODlafm.js";import"./index-BZgvQFWB.js";import"./breakpoints-ClyhurDb.js";import"./index-DuR3D6fo.js";import"./index-CAP_MkSX.js";import"./index-CkmEnIMw.js";import"./index-BT_V7Uuy.js";import"./use-open-state-CqOhkIFZ.js";import"./chunk-EPOLDU6W-Os_zj8jW.js";import"./htmlEntityDecoder-CkdV-qxi.js";import"./index-BX5rs4Nt.js";const nt={title:"Cloudscape Reference/ActionsButton",component:o,tags:["cloudscape-real"],parameters:{layout:"centered",docs:{description:{component:"Real RiskSmart ActionsButton. 1:1 with live app."}}}},r=({children:c})=>e.jsx(a,{initialPath:"/",children:e.jsx("div",{style:{padding:24},children:c})}),t=()=>{},i={render:()=>e.jsx(r,{children:e.jsx(o,{buttonText:"Actions",items:[{id:"export",text:"Export",onItemClick:t},{id:"duplicate",text:"Duplicate",onItemClick:t},{id:"archive",text:"Archive",onItemClick:t},{id:"delete",text:"Delete",onItemClick:t}]})})},n={render:()=>e.jsx(r,{children:e.jsx(o,{buttonText:"Create",variant:"primary",items:[{id:"risk",text:"New risk",onItemClick:t},{id:"control",text:"New control",onItemClick:t},{id:"issue",text:"New issue",onItemClick:t}]})})},s={render:()=>e.jsx(r,{children:e.jsx(o,{buttonText:"Actions",items:[{id:"export",text:"Export",onItemClick:t}]})})},p={render:()=>e.jsx(r,{children:e.jsx(o,{buttonText:"Actions",disabled:!0,items:[{id:"export",text:"Export",onItemClick:t},{id:"archive",text:"Archive",onItemClick:t}]})})},m={render:()=>e.jsx(r,{children:e.jsx(o,{buttonText:"Actions",items:[{id:"export",text:"Export",onItemClick:t},{id:"archive",text:"Archive",disabled:!0,onItemClick:t},{id:"delete",text:"Delete",onItemClick:t}]})})};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <Wrap>
      <ActionsButton buttonText={'Actions'} items={[{
      id: 'export',
      text: 'Export',
      onItemClick: noop
    }, {
      id: 'duplicate',
      text: 'Duplicate',
      onItemClick: noop
    }, {
      id: 'archive',
      text: 'Archive',
      onItemClick: noop
    }, {
      id: 'delete',
      text: 'Delete',
      onItemClick: noop
    }]} />
    </Wrap>
}`,...i.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <Wrap>
      <ActionsButton buttonText={'Create'} variant={'primary'} items={[{
      id: 'risk',
      text: 'New risk',
      onItemClick: noop
    }, {
      id: 'control',
      text: 'New control',
      onItemClick: noop
    }, {
      id: 'issue',
      text: 'New issue',
      onItemClick: noop
    }]} />
    </Wrap>
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <Wrap>
      <ActionsButton buttonText={'Actions'} items={[{
      id: 'export',
      text: 'Export',
      onItemClick: noop
    }]} />
    </Wrap>
}`,...s.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Wrap>
      <ActionsButton buttonText={'Actions'} disabled items={[{
      id: 'export',
      text: 'Export',
      onItemClick: noop
    }, {
      id: 'archive',
      text: 'Archive',
      onItemClick: noop
    }]} />
    </Wrap>
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Wrap>
      <ActionsButton buttonText={'Actions'} items={[{
      id: 'export',
      text: 'Export',
      onItemClick: noop
    }, {
      id: 'archive',
      text: 'Archive',
      disabled: true,
      onItemClick: noop
    }, {
      id: 'delete',
      text: 'Delete',
      onItemClick: noop
    }]} />
    </Wrap>
}`,...m.parameters?.docs?.source}}};const st=["Default","PrimaryVariant","Single","Disabled","ItemsWithDisabledMix"];export{i as Default,p as Disabled,m as ItemsWithDisabledMix,n as PrimaryVariant,s as Single,st as __namedExportsOrder,nt as default};

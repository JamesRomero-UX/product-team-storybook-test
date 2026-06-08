import{j as e}from"./iframe-CGUFCU7f.js";import{A as o}from"./ActionsButton-BwKGxzSB.js";/* empty css              */import{R as a}from"./_providers-BPXkn1NX.js";import"./preload-helper-PPVm8Dsz.js";import"./index-CrRnDCrT.js";import"./apply-display-name-BLkmUqWr.js";import"./internal-SOQZ9Mm1.js";import"./clsx-B-dksMZM.js";import"./internal-D5O6mRBm.js";import"./internal-B-JwIsuO.js";import"./context-D8tPZRIA.js";import"./internal-D4iCGoaF.js";import"./index-ChVYcNbT.js";import"./logging-Do9SP7zB.js";import"./use-funnel-AbMDah8x.js";import"./node-belongs-WtzSDwnj.js";import"./find-up-until-BRKS-4M1.js";import"./selectors-CqP7R3Su.js";import"./single-tab-stop-navigation-context-DKkbNJRw.js";import"./index-KL8ugYfO.js";import"./index-DqesKSp7.js";import"./index-cNOLf2x0.js";import"./internal-DjZrncL4.js";import"./modal-context-6lCMvgDJ.js";import"./check-safe-url-CtPM6X1I.js";import"./internal-ja8OVsdD.js";import"./attributes-BsWGnux6.js";import"./utils-DGIBRVIo.js";import"./keycode-CVkmaVHg.js";import"./scrollable-containers-adW6Dse0.js";import"./index-B7o473QB.js";import"./index-CuCU4ywu.js";import"./use-resize-observer-3Gfl0AxN.js";import"./index-Czpqf29M.js";import"./Transition-CjMv9etq.js";import"./index-CFyePoIQ.js";import"./index-CRODlafm.js";import"./index-gSq0ga6q.js";import"./breakpoints-ClyhurDb.js";import"./index-DW3afH8r.js";import"./index-D_H7yXwx.js";import"./index-CkmEnIMw.js";import"./index-BjhJRrgF.js";import"./use-open-state-aDtJ47yF.js";import"./chunk-EPOLDU6W-DP44Pv5b.js";import"./htmlEntityDecoder-wSt2bSSJ.js";import"./index-C_HPrsPu.js";const nt={title:"Cloudscape Reference/ActionsButton",component:o,tags:["cloudscape-real"],parameters:{layout:"centered",docs:{description:{component:"Real RiskSmart ActionsButton. 1:1 with live app."}}}},r=({children:c})=>e.jsx(a,{initialPath:"/",children:e.jsx("div",{style:{padding:24},children:c})}),t=()=>{},i={render:()=>e.jsx(r,{children:e.jsx(o,{buttonText:"Actions",items:[{id:"export",text:"Export",onItemClick:t},{id:"duplicate",text:"Duplicate",onItemClick:t},{id:"archive",text:"Archive",onItemClick:t},{id:"delete",text:"Delete",onItemClick:t}]})})},n={render:()=>e.jsx(r,{children:e.jsx(o,{buttonText:"Create",variant:"primary",items:[{id:"risk",text:"New risk",onItemClick:t},{id:"control",text:"New control",onItemClick:t},{id:"issue",text:"New issue",onItemClick:t}]})})},s={render:()=>e.jsx(r,{children:e.jsx(o,{buttonText:"Actions",items:[{id:"export",text:"Export",onItemClick:t}]})})},p={render:()=>e.jsx(r,{children:e.jsx(o,{buttonText:"Actions",disabled:!0,items:[{id:"export",text:"Export",onItemClick:t},{id:"archive",text:"Archive",onItemClick:t}]})})},m={render:()=>e.jsx(r,{children:e.jsx(o,{buttonText:"Actions",items:[{id:"export",text:"Export",onItemClick:t},{id:"archive",text:"Archive",disabled:!0,onItemClick:t},{id:"delete",text:"Delete",onItemClick:t}]})})};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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

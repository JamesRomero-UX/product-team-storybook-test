import{j as e,r as w}from"./iframe-BUnym78j.js";import{A as y}from"./index-oykZJbI2.js";import{B as u}from"./index-DEptbsjU.js";/* empty css              */import"./preload-helper-PPVm8Dsz.js";import"./apply-display-name-CKHUfYBo.js";import"./index-CsOBNtUa.js";import"./use-funnel-CyztZGaS.js";import"./node-belongs-DM3X8Ciw.js";import"./find-up-until-BRKS-4M1.js";import"./selectors-CqP7R3Su.js";import"./index-2OBVZBGs.js";import"./internal-GwwvkNEC.js";import"./clsx-B-dksMZM.js";import"./internal-DTQb2lEl.js";import"./context-DgI7pV8n.js";import"./internal-CS48Lg7j.js";import"./index-C_OfJrUg.js";import"./logging-Do9SP7zB.js";import"./single-tab-stop-navigation-context-CiOjkB8Q.js";import"./index-KL8ugYfO.js";import"./index-DWTVc6zx.js";import"./internal-C154RwbQ.js";import"./modal-context-Dao2yP6v.js";import"./check-safe-url-CtPM6X1I.js";import"./internal-DAJpLwfg.js";import"./attributes-BsWGnux6.js";import"./utils-DGIBRVIo.js";import"./keycode-CVkmaVHg.js";import"./scrollable-containers-Di3KpToI.js";import"./index-Cjedr7LG.js";import"./index-BrQu0-NH.js";import"./use-resize-observer-CCSf-OCQ.js";import"./index-BB8hD4a8.js";import"./Transition-w2PxoBaW.js";import"./index-CAP_MkSX.js";import"./link-default-variant-context-B3_QY-cQ.js";import"./api-CnuG0Arp.js";import"./debounce-6Bmtvcts.js";import"./use-container-width-DalB6Gcb.js";import"./use-container-query-JgEnex8Q.js";import"./index-DbZgC_dD.js";import"./internal-CN2lIOd4.js";const F=(i,t=2)=>{if(Math.abs(i)<1024)return i+" B";const d=["kB","MB","GB","TB","PB","EB","ZB","YB"];let n=-1;const s=10**t;do i/=1024,++n;while(Math.round(Math.abs(i)*s)/s>=1024&&n<d.length-1);return i.toFixed(t)+" "+d[n]},r=({fileId:i,onRemove:t,fileName:f,fileSize:d,file:n,error:s,disabled:h,downloadFile:v})=>e.jsx(u,{margin:{vertical:"xs"},children:e.jsx(y,{type:s?"error":"success",onDismiss:t,dismissible:!h,children:e.jsxs("div",{onClick:async()=>{v({fileId:i,fileName:f,file:n})},children:[f,e.jsx("br",{}),e.jsx(u,{variant:"small",children:F(d)})]})})},i||n?.name);r.__docgenInfo={description:"",methods:[],displayName:"FileItem",props:{fileId:{required:!1,tsType:{name:"string"},description:""},file:{required:!1,tsType:{name:"File"},description:""},onRemove:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},fileName:{required:!0,tsType:{name:"string"},description:""},fileSize:{required:!0,tsType:{name:"number"},description:""},timestamp:{required:!0,tsType:{name:"string"},description:""},error:{required:!1,tsType:{name:"boolean"},description:""},disabled:{required:!1,tsType:{name:"boolean"},description:""},downloadFile:{required:!0,tsType:{name:"signature",type:"function",raw:`(
  { fileId, fileName, file }: FileType,
  downloadFile?: boolean
) => Promise<Blob>`,signature:{arguments:[{type:{name:"FileType"},name:""},{type:{name:"boolean"},name:"downloadFile"}],return:{name:"Promise",elements:[{name:"Blob"}],raw:"Promise<Blob>"}}},description:""}}};const le={title:"Cloudscape Reference/FileItem",component:r,tags:["cloudscape-real"],parameters:{layout:"centered",docs:{description:{component:"Real RiskSmart FileItem. 1:1 with live app."}}}},o=i=>{},a={render:()=>e.jsx("div",{style:{width:480},children:e.jsx(r,{fileId:"f-001",fileName:"quarterly-audit-findings.pdf",fileSize:245678,downloadFile:o})})},l={render:()=>e.jsx("div",{style:{width:480},children:e.jsx(r,{fileId:"f-002",fileName:"iam-policy-review.docx",fileSize:1245678,error:{message:"Upload failed — file too large."},downloadFile:o})})},m={render:()=>{const[i,t]=w.useState(!1);return i?e.jsx("div",{style:{width:480,color:"#73738C"},children:"File removed. Refresh story to reset."}):e.jsx("div",{style:{width:480},children:e.jsx(r,{fileId:"f-003",fileName:"control-evidence-jan2026.csv",fileSize:48392,onRemove:()=>t(!0),downloadFile:o})})}},p={render:()=>e.jsx("div",{style:{width:480},children:e.jsx(r,{fileId:"f-004",fileName:"archived-risk-export.pdf",fileSize:3456789,disabled:!0,downloadFile:o})})},c={render:()=>e.jsxs("div",{style:{width:480},children:[e.jsx(r,{fileId:"f-a",fileName:"audit-report.pdf",fileSize:245678,downloadFile:o}),e.jsx(r,{fileId:"f-b",fileName:"evidence-photos.zip",fileSize:4823412,downloadFile:o}),e.jsx(r,{fileId:"f-c",fileName:"broken-upload.docx",fileSize:892134,error:{message:"Upload failed"},downloadFile:o})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 480
  }}>
      <FileItem fileId={'f-001'} fileName={'quarterly-audit-findings.pdf'} fileSize={245_678} downloadFile={noopDownload} />
    </div>
}`,...a.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 480
  }}>
      <FileItem fileId={'f-002'} fileName={'iam-policy-review.docx'} fileSize={1_245_678} error={{
      message: 'Upload failed — file too large.'
    } as any} downloadFile={noopDownload} />
    </div>
}`,...l.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [removed, setRemoved] = useState(false);
    if (removed) {
      return <div style={{
        width: 480,
        color: '#73738C'
      }}>File removed. Refresh story to reset.</div>;
    }
    return <div style={{
      width: 480
    }}>
        <FileItem fileId={'f-003'} fileName={'control-evidence-jan2026.csv'} fileSize={48_392} onRemove={() => setRemoved(true)} downloadFile={noopDownload} />
      </div>;
  }
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 480
  }}>
      <FileItem fileId={'f-004'} fileName={'archived-risk-export.pdf'} fileSize={3_456_789} disabled downloadFile={noopDownload} />
    </div>
}`,...p.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 480
  }}>
      <FileItem fileId={'f-a'} fileName={'audit-report.pdf'} fileSize={245_678} downloadFile={noopDownload} />
      <FileItem fileId={'f-b'} fileName={'evidence-photos.zip'} fileSize={4_823_412} downloadFile={noopDownload} />
      <FileItem fileId={'f-c'} fileName={'broken-upload.docx'} fileSize={892_134} error={{
      message: 'Upload failed'
    } as any} downloadFile={noopDownload} />
    </div>
}`,...c.parameters?.docs?.source}}};const me=["Uploaded","WithError","Dismissable","Disabled","Stack"];export{p as Disabled,m as Dismissable,c as Stack,a as Uploaded,l as WithError,me as __namedExportsOrder,le as default};

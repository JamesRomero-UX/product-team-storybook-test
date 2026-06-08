import{j as e,r as m}from"./iframe-BUnym78j.js";import{C as r}from"./index-QRMnmSvI.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-DCYm8U2k.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./index-B8k91cqS.js";import"./useRenderElement-Ca5MjKVy.js";import"./useControlled-5C_FWl0K.js";import"./useButton-P9eg-YPj.js";import"./visuallyHidden-COI6QeQH.js";import"./useValueChanged-BJTqdMqD.js";import"./index-Cjedr7LG.js";import"./index-BrQu0-NH.js";import"./useBaseUiId-DDkm6U0i.js";import"./FieldItemContext-Z1YcxDG6.js";import"./useOpenChangeComplete-DBFoL7rn.js";const y={title:"Components/Checkbox",component:r,argTypes:{size:{control:"select",options:["sm","md","lg"]}},args:{size:"md"}},s={},t={args:{defaultChecked:!0}},a={render:()=>e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx(r,{size:"sm",defaultChecked:!0}),e.jsx(r,{size:"md",defaultChecked:!0}),e.jsx(r,{size:"lg",defaultChecked:!0})]})},c={args:{disabled:!0}},o={args:{disabled:!0,defaultChecked:!0}},d={render:function(){const[n,i]=m.useState(!1);return e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer text-sm",children:[e.jsx(r,{checked:n,onCheckedChange:i}),"Accept terms and conditions"]})}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    defaultChecked: true
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className={'flex items-center gap-4'}>
      <Checkbox size={'sm'} defaultChecked />
      <Checkbox size={'md'} defaultChecked />
      <Checkbox size={'lg'} defaultChecked />
    </div>
}`,...a.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...c.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultChecked: true
  }
}`,...o.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: function WithLabelStory() {
    const [checked, setChecked] = useState(false);
    return <label className={'flex items-center gap-2 cursor-pointer text-sm'}>
        <Checkbox checked={checked} onCheckedChange={setChecked} />
        {'Accept terms and conditions'}
      </label>;
  }
}`,...d.parameters?.docs?.source}}};const E=["Default","Checked","Sizes","Disabled","DisabledChecked","WithLabel"];export{t as Checked,s as Default,c as Disabled,o as DisabledChecked,a as Sizes,d as WithLabel,E as __namedExportsOrder,y as default};

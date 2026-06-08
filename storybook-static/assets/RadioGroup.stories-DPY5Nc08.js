import{j as e}from"./iframe-BUnym78j.js";import{R as a,a as s}from"./index-Dpl2HS8H.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-DCYm8U2k.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./index-B8k91cqS.js";import"./useControlled-5C_FWl0K.js";import"./useRenderElement-Ca5MjKVy.js";import"./useButton-P9eg-YPj.js";import"./visuallyHidden-COI6QeQH.js";import"./useBaseUiId-DDkm6U0i.js";import"./composite-BSwB0I7Y.js";import"./CompositeRoot-DNhtb6u4.js";import"./isElementDisabled-CwHw_lZC.js";import"./composite-CZocG8cQ.js";import"./useValueChanged-BJTqdMqD.js";import"./index-Cjedr7LG.js";import"./index-BrQu0-NH.js";import"./element-y_ycQrD6.js";import"./useOpenChangeComplete-DBFoL7rn.js";import"./CompositeItem-DbknVT3w.js";import"./FieldItemContext-Z1YcxDG6.js";import"./useLabelableId-C-vyVutt.js";const L={title:"Components/RadioGroup",component:a,tags:["new"],parameters:{layout:"centered"}},t={render:()=>e.jsx("div",{className:"story-tile-group",children:e.jsx("div",{className:"story-tile",children:e.jsxs(a,{defaultValue:"option-1",children:[e.jsxs("label",{className:"flex items-center gap-2 text-sm cursor-pointer",children:[e.jsx(s,{value:"option-1"}),"Option 1"]}),e.jsxs("label",{className:"flex items-center gap-2 text-sm cursor-pointer",children:[e.jsx(s,{value:"option-2"}),"Option 2"]}),e.jsxs("label",{className:"flex items-center gap-2 text-sm cursor-pointer",children:[e.jsx(s,{value:"option-3"}),"Option 3"]})]})})})},l={render:()=>e.jsxs("div",{className:"story-tile-group",children:[e.jsxs("div",{className:"story-tile",children:[e.jsx("p",{className:"text-sm font-medium mb-2",children:"Small"}),e.jsxs(a,{defaultValue:"a",children:[e.jsxs("label",{className:"flex items-center gap-2 text-sm cursor-pointer",children:[e.jsx(s,{value:"a",size:"sm"}),"Small radio"]}),e.jsxs("label",{className:"flex items-center gap-2 text-sm cursor-pointer",children:[e.jsx(s,{value:"b",size:"sm"}),"Small radio"]})]})]}),e.jsxs("div",{className:"story-tile",children:[e.jsx("p",{className:"text-sm font-medium mb-2",children:"Medium"}),e.jsxs(a,{defaultValue:"a",children:[e.jsxs("label",{className:"flex items-center gap-2 text-sm cursor-pointer",children:[e.jsx(s,{value:"a",size:"md"}),"Medium radio"]}),e.jsxs("label",{className:"flex items-center gap-2 text-sm cursor-pointer",children:[e.jsx(s,{value:"b",size:"md"}),"Medium radio"]})]})]}),e.jsxs("div",{className:"story-tile",children:[e.jsx("p",{className:"text-sm font-medium mb-2",children:"Large"}),e.jsxs(a,{defaultValue:"a",children:[e.jsxs("label",{className:"flex items-center gap-2 text-sm cursor-pointer",children:[e.jsx(s,{value:"a",size:"lg"}),"Large radio"]}),e.jsxs("label",{className:"flex items-center gap-2 text-sm cursor-pointer",children:[e.jsx(s,{value:"b",size:"lg"}),"Large radio"]})]})]})]})},r={render:()=>e.jsx("div",{className:"story-tile-group",children:e.jsx("div",{className:"story-tile",children:e.jsxs(a,{defaultValue:"a",orientation:"horizontal",children:[e.jsxs("label",{className:"flex items-center gap-2 text-sm cursor-pointer",children:[e.jsx(s,{value:"a"}),"Option A"]}),e.jsxs("label",{className:"flex items-center gap-2 text-sm cursor-pointer",children:[e.jsx(s,{value:"b"}),"Option B"]}),e.jsxs("label",{className:"flex items-center gap-2 text-sm cursor-pointer",children:[e.jsx(s,{value:"c"}),"Option C"]})]})})})},i={render:()=>e.jsx("div",{className:"story-tile-group",children:e.jsx("div",{className:"story-tile",children:e.jsxs(a,{defaultValue:"a",disabled:!0,children:[e.jsxs("label",{className:"flex items-center gap-2 text-sm cursor-pointer",children:[e.jsx(s,{value:"a"}),"Disabled selected"]}),e.jsxs("label",{className:"flex items-center gap-2 text-sm cursor-pointer",children:[e.jsx(s,{value:"b"}),"Disabled unselected"]})]})})})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <div className={'story-tile-group'}>
      <div className={'story-tile'}>
        <RadioGroup defaultValue={'option-1'}>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'option-1'} />
            {'Option 1'}
          </label>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'option-2'} />
            {'Option 2'}
          </label>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'option-3'} />
            {'Option 3'}
          </label>
        </RadioGroup>
      </div>
    </div>
}`,...t.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className={'story-tile-group'}>
      <div className={'story-tile'}>
        <p className={'text-sm font-medium mb-2'}>{'Small'}</p>
        <RadioGroup defaultValue={'a'}>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'a'} size={'sm'} />
            {'Small radio'}
          </label>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'b'} size={'sm'} />
            {'Small radio'}
          </label>
        </RadioGroup>
      </div>
      <div className={'story-tile'}>
        <p className={'text-sm font-medium mb-2'}>{'Medium'}</p>
        <RadioGroup defaultValue={'a'}>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'a'} size={'md'} />
            {'Medium radio'}
          </label>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'b'} size={'md'} />
            {'Medium radio'}
          </label>
        </RadioGroup>
      </div>
      <div className={'story-tile'}>
        <p className={'text-sm font-medium mb-2'}>{'Large'}</p>
        <RadioGroup defaultValue={'a'}>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'a'} size={'lg'} />
            {'Large radio'}
          </label>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'b'} size={'lg'} />
            {'Large radio'}
          </label>
        </RadioGroup>
      </div>
    </div>
}`,...l.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div className={'story-tile-group'}>
      <div className={'story-tile'}>
        <RadioGroup defaultValue={'a'} orientation={'horizontal'}>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'a'} />
            {'Option A'}
          </label>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'b'} />
            {'Option B'}
          </label>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'c'} />
            {'Option C'}
          </label>
        </RadioGroup>
      </div>
    </div>
}`,...r.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div className={'story-tile-group'}>
      <div className={'story-tile'}>
        <RadioGroup defaultValue={'a'} disabled>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'a'} />
            {'Disabled selected'}
          </label>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'b'} />
            {'Disabled unselected'}
          </label>
        </RadioGroup>
      </div>
    </div>
}`,...i.parameters?.docs?.source}}};const M=["Default","Sizes","Horizontal","Disabled"];export{t as Default,i as Disabled,r as Horizontal,l as Sizes,M as __namedExportsOrder,L as default};

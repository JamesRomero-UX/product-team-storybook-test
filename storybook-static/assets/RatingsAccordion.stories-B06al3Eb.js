import{j as i}from"./iframe-BUnym78j.js";import{R as r,a as o,b as e,c as n}from"./index-CQQGVoax.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Bb02TIDQ.js";import"./utils-DCYm8U2k.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./index-DAsga1CA.js";import"./index-B8k91cqS.js";import"./index-CtjIrCBO.js";import"./useControlled-5C_FWl0K.js";import"./useButton-P9eg-YPj.js";import"./useRenderElement-Ca5MjKVy.js";import"./visuallyHidden-COI6QeQH.js";import"./useBaseUiId-DDkm6U0i.js";import"./useValueChanged-BJTqdMqD.js";import"./index-Cjedr7LG.js";import"./index-BrQu0-NH.js";import"./useLabelableId-C-vyVutt.js";import"./composite-BSwB0I7Y.js";import"./useOpenChangeComplete-DBFoL7rn.js";import"./isElementDisabled-CwHw_lZC.js";import"./index-CBziSGNp.js";import"./useRender-C6qmYnVs.js";import"./index-C7yTHsRP.js";const E={title:"Patterns/RatingsAccordion",component:r,argTypes:{className:{control:"text",description:"Additional tailwind classes to apply to the accordion"}},decorators:[s=>i.jsx("div",{style:{width:"600px",margin:"0 auto"},children:i.jsx(s,{})})]},t={render:()=>i.jsxs(r,{defaultValue:["one"],children:[i.jsxs(o,{value:"one",children:[i.jsx(e,{title:"Likelihood Levels",itemCount:5,isComplete:!0,description:"Define probabilities for the impact-likelihood matrix"}),i.jsx(n,{className:"h-[100px]",children:""})]}),i.jsxs(o,{value:"two",children:[i.jsx(e,{title:"Impact Level Configuration",itemCount:1,description:"Define severity levels for impact assessment"}),i.jsx(n,{className:"h-[100px]",children:""})]}),i.jsxs(o,{value:"three",children:[i.jsx(e,{title:"Risk Matrix Configuration",description:"Define risk ratings for each impact-likelihood combination"}),i.jsx(n,{className:"h-[100px]",children:""})]})]})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <RatingsAccordion defaultValue={['one']}>
      <RatingsAccordionItem value={'one'}>
        <RatingsAccordionTrigger title={'Likelihood Levels'} itemCount={5} isComplete={true} description={'Define probabilities for the impact-likelihood matrix'} />
        <RatingsAccordionContent className={'h-[100px]'}>
          {''}
        </RatingsAccordionContent>
      </RatingsAccordionItem>
      <RatingsAccordionItem value={'two'}>
        <RatingsAccordionTrigger title={'Impact Level Configuration'} itemCount={1} description={'Define severity levels for impact assessment'} />
        <RatingsAccordionContent className={'h-[100px]'}>
          {''}
        </RatingsAccordionContent>
      </RatingsAccordionItem>
      <RatingsAccordionItem value={'three'}>
        <RatingsAccordionTrigger title={'Risk Matrix Configuration'} description={'Define risk ratings for each impact-likelihood combination'} />
        <RatingsAccordionContent className={'h-[100px]'}>
          {''}
        </RatingsAccordionContent>
      </RatingsAccordionItem>
    </RatingsAccordion>
}`,...t.parameters?.docs?.source}}};const M=["Default"];export{t as Default,M as __namedExportsOrder,E as default};

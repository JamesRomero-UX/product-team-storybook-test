import{j as i}from"./iframe-CGUFCU7f.js";import{R as r,a as o,b as e,c as n}from"./index-D2fSdf-u.js";import"./preload-helper-PPVm8Dsz.js";import"./index-CfxlD8Xs.js";import"./utils-DCYm8U2k.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./index-CVrXcT1N.js";import"./index-B8k91cqS.js";import"./index-BlnDAJH2.js";import"./useControlled-Kh7KOzPI.js";import"./useButton-DcZoe7g1.js";import"./useRenderElement-BQbCiycg.js";import"./visuallyHidden-COI6QeQH.js";import"./useBaseUiId-BP1KBVDm.js";import"./useValueChanged-CPtaE3-O.js";import"./index-B7o473QB.js";import"./index-CuCU4ywu.js";import"./useLabelableId-C1-TlTgd.js";import"./composite-DQn3N0_v.js";import"./useOpenChangeComplete-Cv_A3jpp.js";import"./isElementDisabled-CwHw_lZC.js";import"./index-CxFUtOr9.js";import"./useRender-5o01eIur.js";import"./index-D_36kx6Z.js";const E={title:"Patterns/RatingsAccordion",component:r,argTypes:{className:{control:"text",description:"Additional tailwind classes to apply to the accordion"}},decorators:[s=>i.jsx("div",{style:{width:"600px",margin:"0 auto"},children:i.jsx(s,{})})]},t={render:()=>i.jsxs(r,{defaultValue:["one"],children:[i.jsxs(o,{value:"one",children:[i.jsx(e,{title:"Likelihood Levels",itemCount:5,isComplete:!0,description:"Define probabilities for the impact-likelihood matrix"}),i.jsx(n,{className:"h-[100px]",children:""})]}),i.jsxs(o,{value:"two",children:[i.jsx(e,{title:"Impact Level Configuration",itemCount:1,description:"Define severity levels for impact assessment"}),i.jsx(n,{className:"h-[100px]",children:""})]}),i.jsxs(o,{value:"three",children:[i.jsx(e,{title:"Risk Matrix Configuration",description:"Define risk ratings for each impact-likelihood combination"}),i.jsx(n,{className:"h-[100px]",children:""})]})]})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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

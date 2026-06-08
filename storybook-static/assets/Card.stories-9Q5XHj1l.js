import{j as r}from"./iframe-CGUFCU7f.js";import{c as p}from"./utils-DCYm8U2k.js";import{B as j}from"./index-CxFUtOr9.js";import{B as g}from"./index-DYvux3PE.js";import{S as h}from"./index-GQyngMHC.js";import{T as t}from"./index-DcccOjoR.js";import{C as m,a,b as u,c as x,d,e as i,f as n}from"./index-hmndAmaZ.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./index-B8k91cqS.js";import"./useRender-5o01eIur.js";import"./useRenderElement-BQbCiycg.js";import"./useButton-DcZoe7g1.js";const F={title:"Components/Card",component:n,subcomponents:{CardHeader:i,CardTitle:d,CardDescription:x,CardAction:u,CardContent:a,CardFooter:m},argTypes:{variant:{control:"select",options:["neutral","warning","destructive","success"],description:"Visual variant of the card"},size:{control:"select",options:["default","sm"],description:"Size variant of the card"}},args:{variant:"neutral",size:"default"},render:e=>r.jsxs(n,{...e,children:[r.jsxs(i,{children:[r.jsx(d,{children:"Card title"}),r.jsx(x,{children:"Card description"})]}),r.jsx(a,{children:r.jsx(t,{children:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."})}),r.jsx(h,{}),r.jsx(m,{children:r.jsx("p",{children:"Footer content can include additional information or actions."})})]}),parameters:{docs:{description:{component:`A card is a container component that organizes content and actions around a single subject.
It provides visual separation and hierarchy for grouped information.`}}}},s={},o={render:e=>r.jsxs(n,{...e,children:[r.jsxs(i,{children:[r.jsx(d,{children:"Card with action"}),r.jsx(u,{children:r.jsx(j,{variant:"neutral",children:"New"})})]}),r.jsx(a,{children:r.jsx(t,{children:"This card demonstrates the CardAction slot positioned in the top right corner."})}),r.jsx(h,{}),r.jsx(m,{children:r.jsx(g,{children:"Action"})})]})},c={render:e=>r.jsxs("div",{className:p("grid grid-cols-2 gap-4"),children:[r.jsxs(n,{...e,variant:"neutral",children:[r.jsx(i,{children:r.jsx(d,{children:"Neutral"})}),r.jsx(a,{children:r.jsx(t,{children:"Default neutral card variant"})})]}),r.jsxs(n,{...e,variant:"warning",children:[r.jsx(i,{variant:"warning",children:r.jsx(d,{children:"Warning"})}),r.jsx(a,{children:r.jsx(t,{children:"Warning variant for important information"})})]}),r.jsxs(n,{...e,variant:"secondary",children:[r.jsx(i,{variant:"secondary",children:r.jsx(d,{children:"Secondary"})}),r.jsx(a,{children:r.jsx(t,{children:"Secondary variant for additional context"})})]}),r.jsxs(n,{...e,variant:"success",children:[r.jsx(i,{variant:"success",children:r.jsx(d,{children:"Success"})}),r.jsx(a,{children:r.jsx(t,{children:"Success variant for positive outcomes"})})]})]})},l={render:e=>r.jsxs("div",{className:p("flex flex-col gap-4"),children:[r.jsxs(n,{...e,size:"default",children:[r.jsx(i,{children:r.jsx(d,{children:"Default size"})}),r.jsx(a,{children:r.jsx(t,{children:"Standard card with default padding"})})]}),r.jsxs(n,{...e,size:"sm",children:[r.jsx(i,{children:r.jsx(d,{children:"Small size"})}),r.jsx(a,{children:r.jsx(t,{children:"Compact card with reduced padding"})})]})]})},C={render:e=>r.jsx(n,{...e,children:r.jsx(a,{children:r.jsx(t,{children:"A simple card with only content, no header or footer. Useful for minimal layouts."})})})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: args => <Card {...args}>
      <CardHeader>
        <CardTitle>{'Card with action'}</CardTitle>
        <CardAction>
          <Badge variant={'neutral'}>{'New'}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Text>
          {'This card demonstrates the CardAction slot positioned in the top right corner.'}
        </Text>
      </CardContent>
      <Separator />
      <CardFooter>
        <Button>{'Action'}</Button>
      </CardFooter>
    </Card>
}`,...o.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: args => <div className={cn('grid grid-cols-2 gap-4')}>
      <Card {...args} variant={'neutral'}>
        <CardHeader>
          <CardTitle>{'Neutral'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>{'Default neutral card variant'}</Text>
        </CardContent>
      </Card>
      <Card {...args} variant={'warning'}>
        <CardHeader variant={'warning'}>
          <CardTitle>{'Warning'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>{'Warning variant for important information'}</Text>
        </CardContent>
      </Card>
      <Card {...args} variant={'secondary'}>
        <CardHeader variant={'secondary'}>
          <CardTitle>{'Secondary'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>{'Secondary variant for additional context'}</Text>
        </CardContent>
      </Card>
      <Card {...args} variant={'success'}>
        <CardHeader variant={'success'}>
          <CardTitle>{'Success'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>{'Success variant for positive outcomes'}</Text>
        </CardContent>
      </Card>
    </div>
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: args => <div className={cn('flex flex-col gap-4')}>
      <Card {...args} size={'default'}>
        <CardHeader>
          <CardTitle>{'Default size'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>{'Standard card with default padding'}</Text>
        </CardContent>
      </Card>
      <Card {...args} size={'sm'}>
        <CardHeader>
          <CardTitle>{'Small size'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>{'Compact card with reduced padding'}</Text>
        </CardContent>
      </Card>
    </div>
}`,...l.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => <Card {...args}>
      <CardContent>
        <Text>
          {'A simple card with only content, no header or footer. Useful for minimal layouts.'}
        </Text>
      </CardContent>
    </Card>
}`,...C.parameters?.docs?.source}}};const O=["Default","WithAction","Variants","Sizes","ContentOnly"];export{C as ContentOnly,s as Default,l as Sizes,c as Variants,o as WithAction,O as __namedExportsOrder,F as default};

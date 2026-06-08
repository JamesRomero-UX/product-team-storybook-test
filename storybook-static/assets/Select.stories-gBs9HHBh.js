import{r as p,j as e}from"./iframe-BUnym78j.js";import{c as a}from"./utils-DCYm8U2k.js";import{S as t}from"./index-D_NKJ0UL.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./index-DAsga1CA.js";import"./index-B8k91cqS.js";import"./visuallyHidden-COI6QeQH.js";import"./useRenderElement-Ca5MjKVy.js";import"./useControlled-5C_FWl0K.js";import"./useButton-P9eg-YPj.js";import"./getPseudoElementBounds-Cq9a3pKD.js";import"./useOpenChangeComplete-DBFoL7rn.js";import"./index-Cjedr7LG.js";import"./index-BrQu0-NH.js";import"./composite-BSwB0I7Y.js";import"./useBaseUiId-DDkm6U0i.js";import"./element-y_ycQrD6.js";import"./composite-CZocG8cQ.js";import"./useValueChanged-BJTqdMqD.js";import"./useLabelableId-C-vyVutt.js";import"./ToolbarRootContext-pHPS9ZKC.js";const{expect:d,screen:x,userEvent:u,within:f}=__STORYBOOK_MODULE_TEST__,o=[{label:"Select a fruit",value:null},{label:"Apple",value:"apple"},{label:"Banana",value:"banana"},{label:"Blueberry",value:"blueberry"},{label:"Grapes",value:"grapes"},{label:"Pineapple",value:"pineapple"}],g=[{label:"Choose a question",value:null},{label:"Risk name",value:"risk-name"},{label:"Risk tier",value:"risk-tier"},{label:"Owner",value:"owner"}],P={title:"Components/Select",component:t,decorators:[l=>e.jsx("div",{style:{minWidth:"360px",margin:"0 auto"},children:e.jsx(l,{})})]},n={args:{items:o}},r={args:{items:[{label:"Pick a food",value:null}]},render:l=>e.jsxs(t,{...l,children:[e.jsxs(t.Group,{label:"Fruits",children:[e.jsx(t.Option,{value:"apple",children:"Apple"}),e.jsx(t.Option,{value:"banana",children:"Banana"})]}),e.jsxs(t.Group,{label:"Vegetables",children:[e.jsx(t.Option,{value:"carrot",children:"Carrot"}),e.jsx(t.Option,{value:"broccoli",disabled:!0,children:"Broccoli (sold out)"})]}),e.jsx(t.Group,{children:e.jsx(t.Option,{value:"other",children:"Other"})})]}),play:async({canvasElement:l})=>{const m=f(l).getByRole("combobox");await u.click(m);const c=await x.findByRole("option",{name:/apple/i});await d(c).toBeInTheDocument(),await u.click(c)}},s={decorators:[l=>e.jsx("div",{style:{minWidth:"100%",margin:"0 auto"},children:e.jsx(l,{})})],render:()=>{const[l,i]=p.useState("");return e.jsxs("div",{className:a("grid grid-cols-2 gap-[120px] w-full"),children:[e.jsxs("div",{className:a("story-tile w-full mb-12"),children:[e.jsx("p",{className:"text-lg font-medium text-muted-foreground",children:"With default value"}),e.jsx(t,{className:a("flex flex-grow w-full"),items:o,defaultValue:"banana"})]}),e.jsxs("div",{className:a("story-tile w-full mb-12"),children:[e.jsx("p",{className:"text-lg font-medium text-muted-foreground",children:"Controlled"}),e.jsx(t,{className:a("flex flex-grow w-full"),items:g,value:l,onValueChange:i}),e.jsx("p",{className:"text-sm text-muted-foreground",children:`Selected: ${l||"none"}`})]}),e.jsxs("div",{className:a("story-tile w-full mb-12"),children:[e.jsx("p",{className:"text-lg font-medium text-muted-foreground",children:"Invalid"}),e.jsx(t,{className:a("flex flex-grow w-full"),items:o,"aria-invalid":!0})]}),e.jsxs("div",{className:a("story-tile w-full mb-12"),children:[e.jsx("p",{className:"text-lg font-medium text-muted-foreground",children:"Disabled"}),e.jsx(t,{className:a("flex flex-grow w-full"),items:o,disabled:!0})]})]})}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    items: fruitItems
  }
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    items: [{
      label: 'Pick a food',
      value: null
    }]
  },
  render: args => <Select {...args}>
      <Select.Group label={'Fruits'}>
        <Select.Option value={'apple'}>{'Apple'}</Select.Option>
        <Select.Option value={'banana'}>{'Banana'}</Select.Option>
      </Select.Group>
      <Select.Group label={'Vegetables'}>
        <Select.Option value={'carrot'}>{'Carrot'}</Select.Option>
        <Select.Option value={'broccoli'} disabled>
          {'Broccoli (sold out)'}
        </Select.Option>
      </Select.Group>
      <Select.Group>
        <Select.Option value={'other'}>{'Other'}</Select.Option>
      </Select.Group>
    </Select>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Open the select
    const trigger = canvas.getByRole('combobox');
    await userEvent.click(trigger);

    // Options render in a portal — query from screen
    const appleOption = await screen.findByRole('option', {
      name: /apple/i
    });
    await expect(appleOption).toBeInTheDocument();

    // Select an option
    await userEvent.click(appleOption);
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  decorators: [Story => <div style={{
    minWidth: '100%',
    margin: '0 auto'
  }}>
        <Story />
      </div>],
  render: () => {
    const [controlledValue, setControlledValue] = useState<string>('');
    return <div className={cn('grid grid-cols-2 gap-[120px] w-full')}>
        <div className={cn('story-tile w-full mb-12')}>
          <p className={'text-lg font-medium text-muted-foreground'}>
            {'With default value'}
          </p>
          <Select className={cn('flex flex-grow w-full')} items={fruitItems} defaultValue={'banana'} />
        </div>
        <div className={cn('story-tile w-full mb-12')}>
          <p className={'text-lg font-medium text-muted-foreground'}>
            {'Controlled'}
          </p>
          <Select className={cn('flex flex-grow w-full')} items={questionItems} value={controlledValue} onValueChange={setControlledValue} />
          <p className={'text-sm text-muted-foreground'}>
            {\`Selected: \${controlledValue || 'none'}\`}
          </p>
        </div>
        <div className={cn('story-tile w-full mb-12')}>
          <p className={'text-lg font-medium text-muted-foreground'}>
            {'Invalid'}
          </p>
          <Select className={cn('flex flex-grow w-full')} items={fruitItems} aria-invalid={true} />
        </div>
        <div className={cn('story-tile w-full mb-12')}>
          <p className={'text-lg font-medium text-muted-foreground'}>
            {'Disabled'}
          </p>
          <Select className={cn('flex flex-grow w-full')} items={fruitItems} disabled />
        </div>
      </div>;
  }
}`,...s.parameters?.docs?.source}}};const F=["Default","WithGroups","States"];export{n as Default,s as States,r as WithGroups,F as __namedExportsOrder,P as default};

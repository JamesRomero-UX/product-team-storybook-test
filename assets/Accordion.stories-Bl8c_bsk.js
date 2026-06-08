import{j as e,r as I}from"./iframe-CGUFCU7f.js";import{c as j}from"./utils-DCYm8U2k.js";import{S as f}from"./index-GQyngMHC.js";import{A as n}from"./index-CfxlD8Xs.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./useRenderElement-BQbCiycg.js";import"./index-CVrXcT1N.js";import"./index-B8k91cqS.js";import"./index-BlnDAJH2.js";import"./useControlled-Kh7KOzPI.js";import"./useButton-DcZoe7g1.js";import"./visuallyHidden-COI6QeQH.js";import"./useBaseUiId-BP1KBVDm.js";import"./useValueChanged-CPtaE3-O.js";import"./index-B7o473QB.js";import"./index-CuCU4ywu.js";import"./useLabelableId-C1-TlTgd.js";import"./composite-DQn3N0_v.js";import"./useOpenChangeComplete-Cv_A3jpp.js";import"./isElementDisabled-CwHw_lZC.js";const{expect:a,userEvent:v,within:A}=__STORYBOOK_MODULE_TEST__,G={title:"Components/Accordion",component:n,tags:["autodocs"],argTypes:{className:{control:"text",description:"Additional tailwind classes to apply to the accordion"}},decorators:[s=>e.jsx("div",{style:{width:"600px",margin:"0 auto"},children:e.jsx(s,{})})]},l={render:()=>e.jsxs(n,{defaultValue:["one"],children:[e.jsxs(n.Item,{value:"one",children:[e.jsx(n.Header,{children:e.jsx(n.Trigger,{children:"Item One"})}),e.jsx(n.Content,{className:"h-[100px]",children:""})]}),e.jsxs(n.Item,{value:"two",children:[e.jsx(n.Header,{children:e.jsx(n.Trigger,{children:"Item Two"})}),e.jsx(n.Content,{className:"h-[100px]",children:""})]}),e.jsxs(n.Item,{value:"three",children:[e.jsx(n.Header,{children:e.jsx(n.Trigger,{children:"Item Three"})}),e.jsx(n.Content,{className:"h-[100px]",children:""})]})]}),play:async({canvasElement:s})=>{const c=A(s),i=c.getByText("Item One");await a(i).toBeInTheDocument(),await a(i.closest("button")).toHaveAttribute("aria-expanded","true");const r=c.getByText("Item Two");await a(r.closest("button")).toHaveAttribute("aria-expanded","false"),await v.click(r),await a(r.closest("button")).toHaveAttribute("aria-expanded","true"),await a(i.closest("button")).toHaveAttribute("aria-expanded","false")}},m={render:()=>e.jsxs(n,{multiple:!0,defaultValue:["one"],children:[e.jsxs(n.Item,{value:"one",children:[e.jsx(n.Header,{children:e.jsx(n.Trigger,{children:"Item One"})}),e.jsx(n.Content,{className:"h-[100px]",children:""})]}),e.jsxs(n.Item,{value:"two",children:[e.jsx(n.Header,{children:e.jsx(n.Trigger,{children:"Item Two"})}),e.jsx(n.Content,{className:"h-[100px]",children:""})]}),e.jsxs(n.Item,{value:"three",children:[e.jsx(n.Header,{children:e.jsx(n.Trigger,{children:"Item Three"})}),e.jsx(n.Content,{className:"h-[100px]",children:""})]})]}),play:async({canvasElement:s})=>{const c=A(s),i=c.getByText("Item One"),r=c.getByText("Item Two");await a(i.closest("button")).toHaveAttribute("aria-expanded","true"),await a(r.closest("button")).toHaveAttribute("aria-expanded","false"),await v.click(r),await a(r.closest("button")).toHaveAttribute("aria-expanded","true"),await a(i.closest("button")).toHaveAttribute("aria-expanded","true")}},d={render:function(){const c=["default","card","inverse"],[i,r]=I.useState({default:["one"],card:["one"],inverse:["one"]}),g=t=>i[t]??[],w=(t,o)=>r(p=>({...p,[t]:o})),u=(t,o,p)=>{r(x=>{const h=x[t]??[];return{...x,[t]:p?[...h,o]:h.filter(T=>T!==o)}})};return e.jsxs("div",{className:j("flex gap-8 w-full"),children:[e.jsx("div",{className:"flex flex-col gap-8 w-full",children:c.map(t=>e.jsxs("div",{children:[e.jsxs("p",{className:"mb-2 text-lg font-semibold capitalize text-primary",children:[e.jsx("span",{className:"text-muted-foreground",children:"Trigger - "})," ",t]}),e.jsxs(n,{defaultValue:["one"],children:[e.jsxs(n.Item,{value:"one",variant:t,children:[e.jsx(n.Header,{variant:t,children:e.jsx(n.Trigger,{variant:t,children:"Item One"})}),e.jsx(n.Content,{variant:t,className:"h-[80px]",children:"Content area"})]}),e.jsxs(n.Item,{value:"two",variant:t,children:[e.jsx(n.Header,{variant:t,children:e.jsx(n.Trigger,{variant:t,children:"Item Two"})}),e.jsx(n.Content,{variant:t,className:"h-[80px]",children:"Content area"})]})]})]},t))}),e.jsx(f,{orientation:"vertical"}),e.jsx("div",{className:"flex flex-col gap-8 w-full",children:c.map(t=>e.jsxs("div",{children:[e.jsxs("p",{className:"mb-2 text-lg font-semibold capitalize text-primary",children:[e.jsx("span",{className:"text-muted-foreground",children:"Switch Trigger - "})," ",t]}),e.jsxs(n,{multiple:!0,value:g(t),onValueChange:o=>w(t,o),children:[e.jsxs(n.SwitchItem,{value:"one",variant:t,children:[e.jsx(n.SwitchTrigger,{variant:t,checked:g(t).includes("one"),onCheckedChange:o=>u(t,"one",o),children:"Item One"}),e.jsx(n.Content,{variant:t,className:"h-[80px]",children:"Content area"})]}),e.jsxs(n.SwitchItem,{value:"two",variant:t,children:[e.jsx(n.SwitchTrigger,{variant:t,checked:g(t).includes("two"),onCheckedChange:o=>u(t,"two",o),children:"Item Two"}),e.jsx(n.Content,{variant:t,className:"h-[80px]",children:"Content area"})]})]})]},t))})]})}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <Accordion defaultValue={['one']}>
      <Accordion.Item value={'one'}>
        <Accordion.Header>
          <Accordion.Trigger>{'Item One'}</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className={'h-[100px]'}>{''}</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value={'two'}>
        <Accordion.Header>
          <Accordion.Trigger>{'Item Two'}</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className={'h-[100px]'}>{''}</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value={'three'}>
        <Accordion.Header>
          <Accordion.Trigger>{'Item Three'}</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className={'h-[100px]'}>{''}</Accordion.Content>
      </Accordion.Item>
    </Accordion>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Item One should be open by default
    const triggerOne = canvas.getByText('Item One');
    await expect(triggerOne).toBeInTheDocument();
    await expect(triggerOne.closest('button')).toHaveAttribute('aria-expanded', 'true');

    // Item Two should be closed
    const triggerTwo = canvas.getByText('Item Two');
    await expect(triggerTwo.closest('button')).toHaveAttribute('aria-expanded', 'false');

    // Click Item Two to open it (and close Item One in single mode)
    await userEvent.click(triggerTwo);
    await expect(triggerTwo.closest('button')).toHaveAttribute('aria-expanded', 'true');
    await expect(triggerOne.closest('button')).toHaveAttribute('aria-expanded', 'false');
  }
}`,...l.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Accordion multiple defaultValue={['one']}>
      <Accordion.Item value={'one'}>
        <Accordion.Header>
          <Accordion.Trigger>{'Item One'}</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className={'h-[100px]'}>{''}</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value={'two'}>
        <Accordion.Header>
          <Accordion.Trigger>{'Item Two'}</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className={'h-[100px]'}>{''}</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value={'three'}>
        <Accordion.Header>
          <Accordion.Trigger>{'Item Three'}</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className={'h-[100px]'}>{''}</Accordion.Content>
      </Accordion.Item>
    </Accordion>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Item One should be open by default
    const triggerOne = canvas.getByText('Item One');
    const triggerTwo = canvas.getByText('Item Two');
    await expect(triggerOne.closest('button')).toHaveAttribute('aria-expanded', 'true');
    await expect(triggerTwo.closest('button')).toHaveAttribute('aria-expanded', 'false');

    // Click Item Two — in multiple mode, Item One should stay open
    await userEvent.click(triggerTwo);
    await expect(triggerTwo.closest('button')).toHaveAttribute('aria-expanded', 'true');
    await expect(triggerOne.closest('button')).toHaveAttribute('aria-expanded', 'true');
  }
}`,...m.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: function VariantsStory() {
    const variants = ['default', 'card', 'inverse'] as const;
    const [openSections, setOpenSections] = useState<Record<string, string[]>>({
      default: ['one'],
      card: ['one'],
      inverse: ['one']
    });
    const getOpen = (variant: string) => openSections[variant] ?? [];
    const setOpen = (variant: string, values: string[]) => setOpenSections(prev => ({
      ...prev,
      [variant]: values
    }));
    const toggleSection = (variant: string, value: string, checked: boolean) => {
      setOpenSections(prev => {
        const current = prev[variant] ?? [];
        return {
          ...prev,
          [variant]: checked ? [...current, value] : current.filter(v => v !== value)
        };
      });
    };
    return <div className={cn('flex gap-8 w-full')}>
        <div className={'flex flex-col gap-8 w-full'}>
          {variants.map(variant => <div key={variant}>
              <p className={'mb-2 text-lg font-semibold capitalize text-primary'}>
                <span className={'text-muted-foreground'}>{'Trigger - '}</span>{' '}
                {variant}
              </p>
              <Accordion defaultValue={['one']}>
                <Accordion.Item value={'one'} variant={variant}>
                  <Accordion.Header variant={variant}>
                    <Accordion.Trigger variant={variant}>
                      {'Item One'}
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content variant={variant} className={'h-[80px]'}>
                    {'Content area'}
                  </Accordion.Content>
                </Accordion.Item>
                <Accordion.Item value={'two'} variant={variant}>
                  <Accordion.Header variant={variant}>
                    <Accordion.Trigger variant={variant}>
                      {'Item Two'}
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content variant={variant} className={'h-[80px]'}>
                    {'Content area'}
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion>
            </div>)}
        </div>
        <Separator orientation={'vertical'} />
        <div className={'flex flex-col gap-8 w-full'}>
          {variants.map(variant => <div key={variant}>
              <p className={'mb-2 text-lg font-semibold capitalize text-primary'}>
                <span className={'text-muted-foreground'}>
                  {'Switch Trigger - '}
                </span>{' '}
                {variant}
              </p>
              <Accordion multiple value={getOpen(variant)} onValueChange={values => setOpen(variant, values)}>
                <Accordion.SwitchItem value={'one'} variant={variant}>
                  <Accordion.SwitchTrigger variant={variant} checked={getOpen(variant).includes('one')} onCheckedChange={checked => toggleSection(variant, 'one', checked)}>
                    {'Item One'}
                  </Accordion.SwitchTrigger>
                  <Accordion.Content variant={variant} className={'h-[80px]'}>
                    {'Content area'}
                  </Accordion.Content>
                </Accordion.SwitchItem>
                <Accordion.SwitchItem value={'two'} variant={variant}>
                  <Accordion.SwitchTrigger variant={variant} checked={getOpen(variant).includes('two')} onCheckedChange={checked => toggleSection(variant, 'two', checked)}>
                    {'Item Two'}
                  </Accordion.SwitchTrigger>
                  <Accordion.Content variant={variant} className={'h-[80px]'}>
                    {'Content area'}
                  </Accordion.Content>
                </Accordion.SwitchItem>
              </Accordion>
            </div>)}
        </div>
      </div>;
  }
}`,...d.parameters?.docs?.source},description:{story:"Showcases all accordion variants side by side: Default, Card, and Inverse.",...d.parameters?.docs?.description}}};const J=["Default","Multiple","Variants"];export{l as Default,m as Multiple,d as Variants,J as __namedExportsOrder,G as default};

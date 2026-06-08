import{j as e}from"./iframe-CGUFCU7f.js";import{I as i}from"./index-BvgrfbWo.js";import{S as w}from"./index-BlnDAJH2.js";import{F as r,a as s,b as T,c as j,d as b,e as E,f as D,g as I,h as L,i as S}from"./index-CqZh1NEx.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-DCYm8U2k.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./index-B8k91cqS.js";import"./useControlled-Kh7KOzPI.js";import"./useButton-DcZoe7g1.js";import"./useRenderElement-BQbCiycg.js";import"./visuallyHidden-COI6QeQH.js";import"./useBaseUiId-BP1KBVDm.js";import"./useValueChanged-CPtaE3-O.js";import"./index-B7o473QB.js";import"./index-CuCU4ywu.js";import"./useLabelableId-C1-TlTgd.js";import"./index-GQyngMHC.js";const{expect:a,within:o}=__STORYBOOK_MODULE_TEST__,Y={title:"Components/Field",component:r,tags:["wip"],decorators:[n=>e.jsx("div",{style:{minWidth:"400px",margin:"0 auto"},children:e.jsx(n,{})})],parameters:{docs:{description:{component:"`Field` composes a label, input, optional description, and error message\ninto a single accessible unit. Use `FieldGroup` to stack multiple fields,\nand `FieldSet` / `FieldLegend` to group related fields under a heading."}}}},l={render:()=>e.jsxs(r,{children:[e.jsx(s,{htmlFor:"title",children:"Title"}),e.jsx(i,{id:"title",placeholder:"Enter a title…"})]}),play:async({canvasElement:n})=>{const t=o(n);await a(t.getByText("Title")).toBeInTheDocument(),await a(t.getByPlaceholderText("Enter a title…")).toBeInTheDocument()}},d={render:()=>e.jsxs(r,{"data-invalid":!0,children:[e.jsx(s,{htmlFor:"title",children:"Title"}),e.jsx(i,{id:"title",placeholder:"Enter a title…","aria-invalid":!0}),e.jsx(T,{errors:[{message:"This field is required"}]})]}),play:async({canvasElement:n})=>{const t=o(n);await a(t.getByRole("alert")).toHaveTextContent("This field is required")}},c={render:()=>e.jsxs(I,{children:[e.jsx(L,{children:"Personal details"}),e.jsxs(j,{children:[e.jsxs(r,{children:[e.jsx(s,{htmlFor:"first-name",children:"First name"}),e.jsx(i,{id:"first-name",placeholder:"Jane"})]}),e.jsxs(r,{children:[e.jsx(s,{htmlFor:"last-name",children:"Last name"}),e.jsx(i,{id:"last-name",placeholder:"Doe"})]})]})]}),play:async({canvasElement:n})=>{const t=o(n);await a(t.getByText("Personal details")).toBeInTheDocument(),await a(t.getByPlaceholderText("Jane")).toBeInTheDocument(),await a(t.getByPlaceholderText("Doe")).toBeInTheDocument()}},p={render:()=>e.jsxs(I,{children:[e.jsx(L,{variant:"label",children:"Settings"}),e.jsxs(r,{children:[e.jsx(s,{htmlFor:"setting",children:"Option"}),e.jsx(i,{id:"setting",placeholder:"Value"})]})]})},m={render:()=>e.jsx(j,{children:e.jsxs(r,{orientation:"horizontal",children:[e.jsxs(b,{children:[e.jsx(E,{children:"Enable notifications"}),e.jsx(D,{children:"Receive email alerts for important events"})]}),e.jsx(w,{"aria-label":"Enable notifications"})]})}),play:async({canvasElement:n})=>{const t=o(n);await a(t.getByText("Enable notifications")).toBeInTheDocument(),await a(t.getByText("Receive email alerts for important events")).toBeInTheDocument()}},h={render:()=>e.jsx(j,{children:e.jsxs(r,{orientation:"responsive",children:[e.jsxs(b,{children:[e.jsx(E,{children:"Dark mode"}),e.jsx(D,{children:"Toggle the application theme"})]}),e.jsx("div",{children:e.jsx(w,{"aria-label":"Dark mode"})})]})})},u={render:()=>e.jsxs(j,{children:[e.jsxs(r,{children:[e.jsx(s,{htmlFor:"email",children:"Email"}),e.jsx(i,{id:"email",placeholder:"user@example.com"})]}),e.jsx(S,{children:"or"}),e.jsxs(r,{children:[e.jsx(s,{htmlFor:"phone",children:"Phone"}),e.jsx(i,{id:"phone",placeholder:"+1 555 123 4567"})]})]}),play:async({canvasElement:n})=>{const t=o(n);await a(t.getByText("or")).toBeInTheDocument(),await a(t.getAllByRole("separator")).toHaveLength(1)}},F={render:()=>e.jsxs(j,{children:[e.jsxs(r,{children:[e.jsx(s,{htmlFor:"a",children:"Field A"}),e.jsx(i,{id:"a"})]}),e.jsx(S,{}),e.jsxs(r,{children:[e.jsx(s,{htmlFor:"b",children:"Field B"}),e.jsx(i,{id:"b"})]})]})},x={render:()=>e.jsxs(r,{"data-invalid":!0,children:[e.jsx(s,{htmlFor:"password",children:"Password"}),e.jsx(i,{id:"password","aria-invalid":!0}),e.jsx(T,{errors:[{message:"Must be at least 8 characters"},{message:"Must contain a number"},{message:"Must contain a special character"}]})]}),play:async({canvasElement:n})=>{const t=o(n),B=t.getByRole("alert");await a(B).toBeInTheDocument(),await a(t.getByText("Must be at least 8 characters")).toBeInTheDocument(),await a(t.getByText("Must contain a number")).toBeInTheDocument()}},v={render:()=>e.jsxs(r,{"data-invalid":!0,children:[e.jsx(s,{htmlFor:"name",children:"Name"}),e.jsx(i,{id:"name","aria-invalid":!0}),e.jsx(T,{children:"Custom error content"})]}),play:async({canvasElement:n})=>{const t=o(n);await a(t.getByText("Custom error content")).toBeInTheDocument()}},g={render:()=>e.jsxs(r,{children:[e.jsx(s,{htmlFor:"ok",children:"Valid field"}),e.jsx(i,{id:"ok"}),e.jsx(T,{})]}),play:async({canvasElement:n})=>{const t=o(n);await a(t.queryByRole("alert")).not.toBeInTheDocument()}},y={render:()=>e.jsxs(r,{"data-invalid":!0,children:[e.jsx(s,{htmlFor:"dup",children:"Field"}),e.jsx(i,{id:"dup","aria-invalid":!0}),e.jsx(T,{errors:[{message:"Required"},{message:"Required"},{message:"Too short"}]})]}),play:async({canvasElement:n})=>{const t=o(n),B=t.getByRole("alert");await a(B).toBeInTheDocument(),await a(t.getByText("Required")).toBeInTheDocument(),await a(t.getByText("Too short")).toBeInTheDocument()}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <Field>
      <FieldLabel htmlFor={'title'}>{'Title'}</FieldLabel>
      <Input id={'title'} placeholder={'Enter a title…'} />
    </Field>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Title')).toBeInTheDocument();
    await expect(canvas.getByPlaceholderText('Enter a title…')).toBeInTheDocument();
  }
}`,...l.parameters?.docs?.source},description:{story:"A single field with label and text input — the most common use case.",...l.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Field data-invalid>
      <FieldLabel htmlFor={'title'}>{'Title'}</FieldLabel>
      <Input id={'title'} placeholder={'Enter a title…'} aria-invalid={true} />
      <FieldError errors={[{
      message: 'This field is required'
    }]} />
    </Field>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent('This field is required');
  }
}`,...d.parameters?.docs?.source},description:{story:"An invalid field, styled with `data-invalid`.",...d.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <FieldSet>
      <FieldLegend>{'Personal details'}</FieldLegend>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={'first-name'}>{'First name'}</FieldLabel>
          <Input id={'first-name'} placeholder={'Jane'} />
        </Field>
        <Field>
          <FieldLabel htmlFor={'last-name'}>{'Last name'}</FieldLabel>
          <Input id={'last-name'} placeholder={'Doe'} />
        </Field>
      </FieldGroup>
    </FieldSet>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Personal details')).toBeInTheDocument();
    await expect(canvas.getByPlaceholderText('Jane')).toBeInTheDocument();
    await expect(canvas.getByPlaceholderText('Doe')).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source},description:{story:"FieldSet with FieldLegend groups related fields under a heading.",...c.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <FieldSet>
      <FieldLegend variant={'label'}>{'Settings'}</FieldLegend>
      <Field>
        <FieldLabel htmlFor={'setting'}>{'Option'}</FieldLabel>
        <Input id={'setting'} placeholder={'Value'} />
      </Field>
    </FieldSet>
}`,...p.parameters?.docs?.source},description:{story:"FieldLegend with label variant for smaller headings.",...p.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <FieldGroup>
      <Field orientation={'horizontal'}>
        <FieldContent>
          <FieldTitle>{'Enable notifications'}</FieldTitle>
          <FieldDescription>
            {'Receive email alerts for important events'}
          </FieldDescription>
        </FieldContent>
        <Switch aria-label={'Enable notifications'} />
      </Field>
    </FieldGroup>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Enable notifications')).toBeInTheDocument();
    await expect(canvas.getByText('Receive email alerts for important events')).toBeInTheDocument();
  }
}`,...m.parameters?.docs?.source},description:{story:"Horizontal layout with FieldContent for description alongside a control.",...m.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <FieldGroup>
      <Field orientation={'responsive'}>
        <FieldContent>
          <FieldTitle>{'Dark mode'}</FieldTitle>
          <FieldDescription>{'Toggle the application theme'}</FieldDescription>
        </FieldContent>
        <div>
          <Switch aria-label={'Dark mode'} />
        </div>
      </Field>
    </FieldGroup>
}`,...h.parameters?.docs?.source},description:{story:"Responsive orientation adapts from vertical to horizontal at wider widths.",...h.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <FieldGroup>
      <Field>
        <FieldLabel htmlFor={'email'}>{'Email'}</FieldLabel>
        <Input id={'email'} placeholder={'user@example.com'} />
      </Field>
      <FieldSeparator>{'or'}</FieldSeparator>
      <Field>
        <FieldLabel htmlFor={'phone'}>{'Phone'}</FieldLabel>
        <Input id={'phone'} placeholder={'+1 555 123 4567'} />
      </Field>
    </FieldGroup>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('or')).toBeInTheDocument();
    await expect(canvas.getAllByRole('separator')).toHaveLength(1);
  }
}`,...u.parameters?.docs?.source},description:{story:"FieldSeparator divides fields with an optional label.",...u.parameters?.docs?.description}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <FieldGroup>
      <Field>
        <FieldLabel htmlFor={'a'}>{'Field A'}</FieldLabel>
        <Input id={'a'} />
      </Field>
      <FieldSeparator />
      <Field>
        <FieldLabel htmlFor={'b'}>{'Field B'}</FieldLabel>
        <Input id={'b'} />
      </Field>
    </FieldGroup>
}`,...F.parameters?.docs?.source},description:{story:"FieldSeparator without children renders just a line.",...F.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Field data-invalid>
      <FieldLabel htmlFor={'password'}>{'Password'}</FieldLabel>
      <Input id={'password'} aria-invalid={true} />
      <FieldError errors={[{
      message: 'Must be at least 8 characters'
    }, {
      message: 'Must contain a number'
    }, {
      message: 'Must contain a special character'
    }]} />
    </Field>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('alert');
    await expect(alert).toBeInTheDocument();
    await expect(canvas.getByText('Must be at least 8 characters')).toBeInTheDocument();
    await expect(canvas.getByText('Must contain a number')).toBeInTheDocument();
  }
}`,...x.parameters?.docs?.source},description:{story:"FieldError with multiple errors renders a list.",...x.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Field data-invalid>
      <FieldLabel htmlFor={'name'}>{'Name'}</FieldLabel>
      <Input id={'name'} aria-invalid={true} />
      <FieldError>{'Custom error content'}</FieldError>
    </Field>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Custom error content')).toBeInTheDocument();
  }
}`,...v.parameters?.docs?.source},description:{story:"FieldError with children overrides the errors prop.",...v.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Field>
      <FieldLabel htmlFor={'ok'}>{'Valid field'}</FieldLabel>
      <Input id={'ok'} />
      <FieldError />
    </Field>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  }
}`,...g.parameters?.docs?.source},description:{story:"FieldError with no errors and no children renders nothing.",...g.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Field data-invalid>
      <FieldLabel htmlFor={'dup'}>{'Field'}</FieldLabel>
      <Input id={'dup'} aria-invalid={true} />
      <FieldError errors={[{
      message: 'Required'
    }, {
      message: 'Required'
    }, {
      message: 'Too short'
    }]} />
    </Field>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('alert');
    await expect(alert).toBeInTheDocument();
    // Duplicates should be deduplicated, showing both unique messages in a list
    await expect(canvas.getByText('Required')).toBeInTheDocument();
    await expect(canvas.getByText('Too short')).toBeInTheDocument();
  }
}`,...y.parameters?.docs?.source},description:{story:"FieldError deduplicates identical error messages.",...y.parameters?.docs?.description}}};const Q=["Default","Invalid","WithFieldSet","LegendLabelVariant","HorizontalWithContent","ResponsiveOrientation","WithSeparator","SeparatorWithoutLabel","MultipleErrors","ErrorWithChildren","NoErrors","DuplicateErrors"];export{l as Default,y as DuplicateErrors,v as ErrorWithChildren,m as HorizontalWithContent,d as Invalid,p as LegendLabelVariant,x as MultipleErrors,g as NoErrors,h as ResponsiveOrientation,F as SeparatorWithoutLabel,c as WithFieldSet,u as WithSeparator,Q as __namedExportsOrder,Y as default};

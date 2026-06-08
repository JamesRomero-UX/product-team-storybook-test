import{r as E,j as e}from"./iframe-BUnym78j.js";import"./index-Bb02TIDQ.js";import"./index-CRRpMv4h.js";import"./index-xq-ASM7n.js";import{c as j}from"./utils-DCYm8U2k.js";import"./index-C7yTHsRP.js";import"./index-CuxF2Xv5.js";import{B as t}from"./index-BY0kkQuY.js";import"./index-ZDq-Xeuo.js";import"./index-QRMnmSvI.js";import"./index-Dyi5WUzK.js";import{D as T,a as C,b as f,c as b,d as S,e as R,f as F,g as z,h as O,i as k,j as H,k as o}from"./index-DIH3eVzB.js";import"./index-aDmoPMh2.js";import"./index-j7EGGt3t.js";import{I as N}from"./index-DAsga1CA.js";import"./index-Bs1e9xXM.js";import"./index-Dpl2HS8H.js";import"./index-D_NKJ0UL.js";import"./index-DGeIQDaT.js";import"./index-EvlZhN_f.js";import"./index-CtjIrCBO.js";import{T as d}from"./index-BQ2MBVFQ.js";import"./index-OzwKdUUK.js";import"./index-D3K7Ywc6.js";import"./preload-helper-PPVm8Dsz.js";import"./index-B8k91cqS.js";import"./clsx-B-dksMZM.js";import"./useControlled-5C_FWl0K.js";import"./useButton-P9eg-YPj.js";import"./useRenderElement-Ca5MjKVy.js";import"./composite-BSwB0I7Y.js";import"./useBaseUiId-DDkm6U0i.js";import"./useOpenChangeComplete-DBFoL7rn.js";import"./index-Cjedr7LG.js";import"./index-BrQu0-NH.js";import"./isElementDisabled-CwHw_lZC.js";import"./index-Ciqn2WuZ.js";import"./visuallyHidden-COI6QeQH.js";import"./useValueChanged-BJTqdMqD.js";import"./FieldItemContext-Z1YcxDG6.js";import"./getPseudoElementBounds-Cq9a3pKD.js";import"./element-y_ycQrD6.js";import"./composite-CZocG8cQ.js";import"./react-BDbfsZLH.js";import"./ToolbarRootContext-pHPS9ZKC.js";import"./CompositeItem-DbknVT3w.js";import"./CompositeRoot-DNhtb6u4.js";import"./useLabelableId-C-vyVutt.js";import"./useRender-C6qmYnVs.js";import"./ToggleGroup-7_ZqpcRz.js";const{expect:i,screen:s,spyOn:P,userEvent:c,waitFor:g,within:a}=__STORYBOOK_MODULE_TEST__,qe={title:"Components/Dialog",component:o,subcomponents:{DialogRoot:H,DialogTrigger:k,DialogPortal:O,DialogBackdrop:z,DialogPopup:F,DialogTitle:R,DialogDescription:S,DialogClose:b,DialogHeader:f,DialogBody:C,DialogFooter:T},parameters:{docs:{description:{component:'Dialog components for building modal windows.\n\n## Quick start — `Dialog` compound component\n\nUse the `Dialog` compound component for the most common use case. It wraps\nthe low-level parts into a simple props-based API:\n\n```tsx\n<Dialog trigger={<Button>Open</Button>} size="lg">\n  <Dialog.Header title="Title" description="Description" />\n  <Dialog.Body>Content</Dialog.Body>\n  <Dialog.Footer>\n    <Button>Save</Button>\n    <Dialog.Close render={<Button variant="neutral" style="outline">Cancel</Button>} />\n  </Dialog.Footer>\n</Dialog>\n```\n\n## Low-level parts\n\nFor full control over the dialog structure, compose the primitives directly:\n`DialogRoot`, `DialogTrigger`, `DialogPortal`, `DialogBackdrop`,\n`DialogPopup`, `DialogTitle`, `DialogDescription`, `DialogClose`,\n`DialogHeader`, `DialogBody`, `DialogFooter`.\n\nSee the **`Primitives`** story at the **bottom of this page** for an example of this approach.'}}}},m={args:{trigger:e.jsx(t,{children:"Open dialog"}),size:"lg"},render:n=>e.jsxs(o,{...n,children:[e.jsx(o.Header,{title:"Dialog title",description:"Dialog description goes here."}),e.jsx(o.Body,{children:e.jsx(d,{children:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."})}),e.jsxs(o.Footer,{children:[e.jsx(t,{onClick:()=>alert("Submitted!"),children:"Save"}),e.jsx(o.Close,{render:e.jsx(t,{variant:"neutral",style:"outline",children:"Cancel"})})]})]}),play:async({canvasElement:n})=>{const l=a(n).getByRole("button",{name:/open dialog/i});await i(s.queryByRole("dialog")).not.toBeInTheDocument(),await c.click(l);const r=await s.findByRole("dialog");await g(()=>{i(a(r).getByText("Dialog title")).toBeVisible()}),await i(a(r).getByText("Dialog description goes here.")).toBeVisible(),await i(a(r).getByRole("button",{name:/save/i})).toBeVisible(),await i(a(r).getByRole("button",{name:/cancel/i})).toBeVisible(),await i(a(r).getByRole("button",{name:/close/i})).toBeVisible(),await c.click(a(r).getByRole("button",{name:/close/i})),await g(()=>{i(s.queryByRole("dialog")).not.toBeInTheDocument()}),await c.click(l);const u=await s.findByRole("dialog");await g(()=>{i(a(u).getByText("Dialog title")).toBeVisible()});const q=P(window,"alert");await c.click(a(u).getByRole("button",{name:/save/i})),await g(()=>{i(q).toHaveBeenCalledWith("Submitted!")}),await c.click(a(u).getByRole("button",{name:/cancel/i})),await g(()=>{i(s.queryByRole("dialog")).not.toBeInTheDocument()})}},h={render:()=>e.jsx("div",{className:j("flex gap-4 flex-wrap"),children:["sm","md","lg","xl"].map(n=>e.jsxs(o,{trigger:e.jsx(t,{children:`Size: ${n}`}),size:n,children:[e.jsx(o.Header,{title:`${n.toUpperCase()} dialog`,description:`This dialog uses the "${n}" size variant.`}),e.jsx(o.Body,{children:e.jsx(d,{children:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."})}),e.jsxs(o.Footer,{children:[e.jsx(t,{children:"Confirm"}),e.jsx(o.Close,{render:e.jsx(t,{variant:"neutral",style:"outline",children:"Cancel"})})]})]},n))})},B={args:{trigger:e.jsx(t,{children:"Open dialog"}),size:"lg"},render:n=>e.jsxs(o,{...n,children:[e.jsx(o.Header,{title:"Notifications"}),e.jsxs(o.Body,{children:[e.jsx(d,{children:"Configure your notification preferences."}),e.jsx(d,{children:"You'll notice this dialog only has a title and no description. How neat is that?"})]}),e.jsxs(o.Footer,{children:[e.jsx(t,{children:"Save"}),e.jsx(o.Close,{render:e.jsx(t,{variant:"neutral",style:"outline",children:"Cancel"})})]})]})},D={args:{trigger:e.jsx(t,{children:"Open scrollable dialog"}),size:"lg"},render:n=>e.jsxs(o,{...n,children:[e.jsx(o.Header,{title:"Terms and conditions",description:"Please review the following terms."}),e.jsx(o.Body,{children:Array.from({length:10}).map((p,l)=>e.jsx("p",{className:j("mb-4 text-base"),children:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},l))}),e.jsxs(o.Footer,{children:[e.jsx(t,{children:"Save"}),e.jsx(o.Close,{render:e.jsx(t,{variant:"neutral",style:"outline",children:"Cancel"})})]})]})},x={args:{trigger:e.jsx(t,{children:"Open simple dialog"}),size:"lg"},render:n=>e.jsxs(o,{...n,children:[e.jsx(o.Body,{children:e.jsx(d,{children:"This dialog has no header, just this message, a standard footer and a close button in the top right corner."})}),e.jsxs(o.Footer,{children:[e.jsx(t,{children:"Save"}),e.jsx(o.Close,{render:e.jsx(t,{variant:"neutral",style:"outline",children:"Cancel"})})]})]})},y={args:{open:!1,size:"lg"},render:n=>{const[p,l]=E.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(t,{variant:"neutral",onClick:()=>l(r=>!r),children:"This is not a Dialog Trigger"}),e.jsxs(o,{...n,open:p,onOpenChange:l,children:[e.jsx(o.Header,{title:"Controlled dialog",description:"Opened without a trigger element."}),e.jsx(o.Body,{children:e.jsx(d,{children:"This dialog is controlled externally. There is no trigger button rendered in the DOM."})}),e.jsxs(o.Footer,{children:[e.jsx(t,{children:"Save"}),e.jsx(o.Close,{render:e.jsx(t,{variant:"neutral",style:"outline",children:"Cancel"})}),e.jsx(t,{onClick:()=>l(r=>!r),children:"This is not a Dialog Close button"})]})]})]})},play:async({canvasElement:n})=>{const l=a(n).getByRole("button",{name:/this is not a dialog trigger/i});await i(s.queryByRole("dialog")).not.toBeInTheDocument(),await c.click(l);const r=await s.findByRole("dialog");await g(()=>{i(a(r).getByText("Controlled dialog")).toBeVisible()});const u=a(r).getByRole("button",{name:/this is not a dialog close button/i});await c.click(u),await g(()=>{i(s.queryByRole("dialog")).not.toBeInTheDocument()})}},v={args:{trigger:e.jsx(t,{children:"Open custom header dialog"}),size:"lg"},render:n=>e.jsxs(o,{...n,children:[e.jsx(o.Header,{children:e.jsx(d,{className:j("text-sm font-medium text-primary"),children:"Step 2 of 4"})}),e.jsx(o.Body,{children:e.jsx(d,{children:"The header renders arbitrary children alongside the close button. No title or description is used here."})}),e.jsxs(o.Footer,{children:[e.jsx(t,{children:"Save"}),e.jsx(o.Close,{render:e.jsx(t,{variant:"neutral",style:"outline",children:"Cancel"})})]})]}),play:async({canvasElement:n})=>{const l=a(n).getByRole("button",{name:/open custom header dialog/i});await c.click(l),await g(()=>i(s.getByText("Step 2 of 4")).toBeVisible())}},w={render:()=>e.jsxs(H,{children:[e.jsx(k,{render:e.jsx(t,{}),children:"Open primitives dialog"}),e.jsxs(O,{children:[e.jsx(z,{}),e.jsxs(F,{size:"lg",children:[e.jsxs(f,{children:[e.jsxs("div",{children:[e.jsx(R,{children:"Primitives example"}),e.jsx(S,{children:"This dialog is composed from individual primitives."})]}),e.jsx(b,{render:e.jsx(t,{className:j("p-0 size-auto"),variant:"neutral",style:"ghost",size:"icon",children:e.jsx(N,{name:"x",size:"sm"})}),"aria-label":"Close"})]}),e.jsx(C,{children:e.jsx(d,{children:"Use this approach when the compound Dialog component does not cover your use case. You have full control over layout, sizing, and behaviour."})}),e.jsxs(T,{children:[e.jsx(t,{children:"Confirm"}),e.jsx(b,{render:e.jsx(t,{variant:"neutral",style:"outline",children:"Cancel"})})]})]})]})]})};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: <Button>{'Open dialog'}</Button>,
    size: 'lg'
  },
  render: args => <Dialog {...args}>
      <Dialog.Header title={'Dialog title'} description={'Dialog description goes here.'} />
      <Dialog.Body>
        <Text>
          {'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
        </Text>
      </Dialog.Body>
      <Dialog.Footer>
        <Button onClick={() => alert('Submitted!')}>{'Save'}</Button>
        <Dialog.Close render={<Button variant={'neutral'} style={'outline'}>
              {'Cancel'}
            </Button>} />
      </Dialog.Footer>
    </Dialog>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: /open dialog/i
    });
    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => {
      expect(within(dialog).getByText('Dialog title')).toBeVisible();
    });
    await expect(within(dialog).getByText('Dialog description goes here.')).toBeVisible();
    await expect(within(dialog).getByRole('button', {
      name: /save/i
    })).toBeVisible();
    await expect(within(dialog).getByRole('button', {
      name: /cancel/i
    })).toBeVisible();
    await expect(within(dialog).getByRole('button', {
      name: /close/i
    })).toBeVisible();
    await userEvent.click(within(dialog).getByRole('button', {
      name: /close/i
    }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await userEvent.click(trigger);
    const dialog2 = await screen.findByRole('dialog');
    await waitFor(() => {
      expect(within(dialog2).getByText('Dialog title')).toBeVisible();
    });
    const alertSpy = spyOn(window, 'alert');
    await userEvent.click(within(dialog2).getByRole('button', {
      name: /save/i
    }));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Submitted!');
    });
    await userEvent.click(within(dialog2).getByRole('button', {
      name: /cancel/i
    }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  }
}`,...m.parameters?.docs?.source},description:{story:"The simplest usage: provide a `trigger` and compose the dialog content\nusing `Dialog.Header`, `Dialog.Body`, and `Dialog.Footer` sub-components.",...m.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div className={cn('flex gap-4 flex-wrap')}>
      {(['sm', 'md', 'lg', 'xl'] as (keyof typeof size)[]).map(sizeName => <Dialog key={sizeName} trigger={<Button>{\`Size: \${sizeName}\`}</Button>} size={sizeName}>
          <Dialog.Header title={\`\${sizeName.toUpperCase()} dialog\`} description={\`This dialog uses the "\${sizeName}" size variant.\`} />
          <Dialog.Body>
            <Text>
              {'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
            </Text>
          </Dialog.Body>
          <Dialog.Footer>
            <Button>{'Confirm'}</Button>
            <Dialog.Close render={<Button variant={'neutral'} style={'outline'}>
                  {'Cancel'}
                </Button>} />
          </Dialog.Footer>
        </Dialog>)}
    </div>
}`,...h.parameters?.docs?.source},description:{story:"`Dialog` accepts a `size` prop that controls the max-width of the\ndialog panel. Available sizes: `sm`, `md` (default), `lg`, `xl`.",...h.parameters?.docs?.description}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: <Button>{'Open dialog'}</Button>,
    size: 'lg'
  },
  render: args => <Dialog {...args}>
      <Dialog.Header title={'Notifications'} />
      <Dialog.Body>
        <Text>{'Configure your notification preferences.'}</Text>
        <Text>
          {"You'll notice this dialog only has a title and no description. How neat is that?"}
        </Text>
      </Dialog.Body>
      <Dialog.Footer>
        <Button>{'Save'}</Button>
        <Dialog.Close render={<Button variant={'neutral'} style={'outline'}>
              {'Cancel'}
            </Button>} />
      </Dialog.Footer>
    </Dialog>
}`,...B.parameters?.docs?.source},description:{story:"Use `Dialog.Header` with only a `title` prop for a compact header.",...B.parameters?.docs?.description}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: <Button>{'Open scrollable dialog'}</Button>,
    size: 'lg'
  },
  render: args => <Dialog {...args}>
      <Dialog.Header title={'Terms and conditions'} description={'Please review the following terms.'} />
      <Dialog.Body>
        {Array.from({
        length: 10
      }).map((_, i) => <p key={i} className={cn('mb-4 text-base')}>
            {'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'}
          </p>)}
      </Dialog.Body>
      <Dialog.Footer>
        <Button>{'Save'}</Button>
        <Dialog.Close render={<Button variant={'neutral'} style={'outline'}>
              {'Cancel'}
            </Button>} />
      </Dialog.Footer>
    </Dialog>
}`,...D.parameters?.docs?.source},description:{story:"When `Dialog.Body` contains a large amount of content, the body area\nautomatically becomes scrollable (capped at 60vh) while the header\nand footer remain fixed.",...D.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: <Button>{'Open simple dialog'}</Button>,
    size: 'lg'
  },
  render: args => <Dialog {...args}>
      <Dialog.Body>
        <Text>
          {'This dialog has no header, just this message, a standard footer and a close button in the top right corner.'}
        </Text>
      </Dialog.Body>
      <Dialog.Footer>
        <Button>{'Save'}</Button>
        <Dialog.Close render={<Button variant={'neutral'} style={'outline'}>
              {'Cancel'}
            </Button>} />
      </Dialog.Footer>
    </Dialog>
}`,...x.parameters?.docs?.source},description:{story:"No header content, just a simple message in the body and a standard footer.",...x.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    open: false,
    size: 'lg'
  },
  render: args => {
    const [open, setOpen] = useState(false);
    return <>
        <Button variant={'neutral'} onClick={() => setOpen(prev => !prev)}>
          {'This is not a Dialog Trigger'}
        </Button>
        <Dialog {...args} open={open} onOpenChange={setOpen}>
          <Dialog.Header title={'Controlled dialog'} description={'Opened without a trigger element.'} />
          <Dialog.Body>
            <Text>
              {'This dialog is controlled externally. There is no trigger button rendered in the DOM.'}
            </Text>
          </Dialog.Body>
          <Dialog.Footer>
            <Button>{'Save'}</Button>
            <Dialog.Close render={<Button variant={'neutral'} style={'outline'}>
                  {'Cancel'}
                </Button>} />
            <Button onClick={() => setOpen(prev => !prev)}>
              {'This is not a Dialog Close button'}
            </Button>
          </Dialog.Footer>
        </Dialog>
      </>;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const externalButton = canvas.getByRole('button', {
      name: /this is not a dialog trigger/i
    });
    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(externalButton);
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => {
      expect(within(dialog).getByText('Controlled dialog')).toBeVisible();
    });
    const externalCloseButton = within(dialog).getByRole('button', {
      name: /this is not a dialog close button/i
    });
    await userEvent.click(externalCloseButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  }
}`,...y.parameters?.docs?.source},description:{story:"Controlled mode without a `trigger` element. The dialog is opened via\n`open` / `onOpenChange` props, so no trigger is rendered in the DOM.",...y.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: <Button>{'Open custom header dialog'}</Button>,
    size: 'lg'
  },
  render: args => <Dialog {...args}>
      <Dialog.Header>
        <Text className={cn('text-sm font-medium text-primary')}>
          {'Step 2 of 4'}
        </Text>
      </Dialog.Header>
      <Dialog.Body>
        <Text>
          {'The header renders arbitrary children alongside the close button. No title or description is used here.'}
        </Text>
      </Dialog.Body>
      <Dialog.Footer>
        <Button>{'Save'}</Button>
        <Dialog.Close render={<Button variant={'neutral'} style={'outline'}>
              {'Cancel'}
            </Button>} />
      </Dialog.Footer>
    </Dialog>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: /open custom header dialog/i
    });
    await userEvent.click(trigger);
    await waitFor(() => expect(screen.getByText('Step 2 of 4')).toBeVisible());
  }
}`,...v.parameters?.docs?.source},description:{story:"A header with arbitrary content instead of a title or description.\nThis shows how the `Dialog.Header` `children` prop can be used to render\ncustom content alongside the close button.",...v.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <DialogRoot>
      <DialogTrigger render={<Button />}>
        {'Open primitives dialog'}
      </DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup size={'lg'}>
          <DialogHeader>
            <div>
              <DialogTitle>{'Primitives example'}</DialogTitle>
              <DialogDescription>
                {'This dialog is composed from individual primitives.'}
              </DialogDescription>
            </div>
            <DialogClose render={<Button className={cn('p-0 size-auto')} variant={'neutral'} style={'ghost'} size={'icon'}>
                  <Icon name={'x'} size={'sm'} />
                </Button>} aria-label={'Close'} />
          </DialogHeader>
          <DialogBody>
            <Text>
              {'Use this approach when the compound Dialog component does not cover your use case. You have full control over layout, sizing, and behaviour.'}
            </Text>
          </DialogBody>
          <DialogFooter>
            <Button>{'Confirm'}</Button>
            <DialogClose render={<Button variant={'neutral'} style={'outline'}>
                  {'Cancel'}
                </Button>} />
          </DialogFooter>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
}`,...w.parameters?.docs?.source},description:{story:"For full control over the dialog structure, compose the low-level\nprimitives directly: `DialogRoot`, `DialogTrigger`, `DialogPortal`,\n`DialogBackdrop`, `DialogPopup`, `DialogTitle`, `DialogDescription`,\n`DialogClose`, `DialogHeader`, `DialogBody`, `DialogFooter`.",...w.parameters?.docs?.description}}};const Ee=["Default","Sizes","TitleOnly","ScrollableBody","NoHeader","ControlledNoTrigger","CustomHeaderContent","Primitives"];export{y as ControlledNoTrigger,v as CustomHeaderContent,m as Default,x as NoHeader,w as Primitives,D as ScrollableBody,h as Sizes,B as TitleOnly,Ee as __namedExportsOrder,qe as default};

import{j as c}from"./iframe-BUnym78j.js";import"./index-Bb02TIDQ.js";import"./index-CRRpMv4h.js";import"./index-xq-ASM7n.js";import"./index-Ciqn2WuZ.js";import"./index-C7yTHsRP.js";import"./index-CuxF2Xv5.js";import"./index-BY0kkQuY.js";import{f as u}from"./index-ZDq-Xeuo.js";import"./index-QRMnmSvI.js";import"./index-Dyi5WUzK.js";import"./index-DIH3eVzB.js";import"./index-aDmoPMh2.js";import"./index-j7EGGt3t.js";import"./index-DAsga1CA.js";import"./index-Bs1e9xXM.js";import"./index-Dpl2HS8H.js";import"./index-D_NKJ0UL.js";import"./index-DGeIQDaT.js";import"./index-EvlZhN_f.js";import"./index-CtjIrCBO.js";import"./index-OzwKdUUK.js";import"./index-D3K7Ywc6.js";import{C as m}from"./index-C8g4q9yM.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-DCYm8U2k.js";import"./clsx-B-dksMZM.js";import"./index-B8k91cqS.js";import"./useControlled-5C_FWl0K.js";import"./useButton-P9eg-YPj.js";import"./useRenderElement-Ca5MjKVy.js";import"./composite-BSwB0I7Y.js";import"./useBaseUiId-DDkm6U0i.js";import"./useOpenChangeComplete-DBFoL7rn.js";import"./index-Cjedr7LG.js";import"./index-BrQu0-NH.js";import"./isElementDisabled-CwHw_lZC.js";import"./index-BQ2MBVFQ.js";import"./useRender-C6qmYnVs.js";import"./visuallyHidden-COI6QeQH.js";import"./useValueChanged-BJTqdMqD.js";import"./FieldItemContext-Z1YcxDG6.js";import"./getPseudoElementBounds-Cq9a3pKD.js";import"./element-y_ycQrD6.js";import"./composite-CZocG8cQ.js";import"./react-BDbfsZLH.js";import"./ToolbarRootContext-pHPS9ZKC.js";import"./CompositeItem-DbknVT3w.js";import"./CompositeRoot-DNhtb6u4.js";import"./useLabelableId-C-vyVutt.js";import"./ToggleGroup-7_ZqpcRz.js";const{expect:t,fn:d,userEvent:o,waitFor:n,within:B}=__STORYBOOK_MODULE_TEST__,ue={title:"Patterns/ConfirmableDeleteButton",component:m,tags:["new"],parameters:{layout:"centered"},args:{onConfirm:d()}},a={render:i=>c.jsx(u,{className:"flex w-full min-w-[200px] items-end rounded-lg border border-solid border-neutral-border p-4",children:c.jsx(m,{...i})}),play:async({canvasElement:i,args:s})=>{const e=B(i),r=e.getByRole("button",{name:/delete/i});await t(r).toBeVisible(),await t(e.queryByRole("button",{name:/cancel delete/i})).not.toBeInTheDocument(),await o.click(r),await n(()=>{t(e.getByRole("button",{name:/cancel delete/i})).toBeVisible()}),await o.click(e.getByRole("button",{name:/cancel delete/i})),await n(()=>{t(e.getByRole("button",{name:/delete/i})).toBeVisible(),t(e.queryByRole("button",{name:/cancel delete/i})).not.toBeInTheDocument()}),await o.click(e.getByRole("button",{name:/delete/i})),await n(()=>{t(e.getByRole("button",{name:/cancel delete/i})).toBeVisible()});const p=s.onConfirm,l=e.getByRole("button",{name:/^delete$/i});await n(()=>{t(l).toBeVisible()}),await o.click(l),await n(()=>{t(p).toHaveBeenCalledOnce()}),await n(()=>{t(e.getByRole("button",{name:/delete/i})).toBeVisible(),t(e.queryByRole("button",{name:/cancel delete/i})).not.toBeInTheDocument()})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: args => {
    return <Card className={'flex w-full min-w-[200px] items-end rounded-lg border border-solid border-neutral-border p-4'}>
        <ConfirmableDeleteButton {...args} />
      </Card>;
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);

    // Initially shows the trash button, no Cancel button
    const trashButton = canvas.getByRole('button', {
      name: /delete/i
    });
    await expect(trashButton).toBeVisible();
    await expect(canvas.queryByRole('button', {
      name: /cancel delete/i
    })).not.toBeInTheDocument();

    // Click trash → Cancel (X) button appears
    await userEvent.click(trashButton);
    await waitFor(() => {
      expect(canvas.getByRole('button', {
        name: /cancel delete/i
      })).toBeVisible();
    });

    // Click Cancel (X) → trash button returns
    await userEvent.click(canvas.getByRole('button', {
      name: /cancel delete/i
    }));
    await waitFor(() => {
      expect(canvas.getByRole('button', {
        name: /delete/i
      })).toBeVisible();
      expect(canvas.queryByRole('button', {
        name: /cancel delete/i
      })).not.toBeInTheDocument();
    });

    // Click trash again → confirm deletion this time
    await userEvent.click(canvas.getByRole('button', {
      name: /delete/i
    }));
    await waitFor(() => {
      expect(canvas.getByRole('button', {
        name: /cancel delete/i
      })).toBeVisible();
    });

    // Click the red Delete confirmation button → calls onConfirm
    const confirmSpy = args.onConfirm;
    const confirmBtn = canvas.getByRole('button', {
      name: /^delete$/i
    });
    await waitFor(() => {
      expect(confirmBtn).toBeVisible();
    });
    await userEvent.click(confirmBtn);
    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledOnce();
    });

    // After confirm, returns to initial state
    await waitFor(() => {
      expect(canvas.getByRole('button', {
        name: /delete/i
      })).toBeVisible();
      expect(canvas.queryByRole('button', {
        name: /cancel delete/i
      })).not.toBeInTheDocument();
    });
  }
}`,...a.parameters?.docs?.source}}};const de=["Default"];export{a as Default,de as __namedExportsOrder,ue as default};

import{j as c}from"./iframe-CGUFCU7f.js";import"./index-CfxlD8Xs.js";import"./index-BoMshO7v.js";import"./index-u3z_k5JR.js";import"./index-Ciqn2WuZ.js";import"./index-D_36kx6Z.js";import"./index-CleBzkog.js";import"./index-DYvux3PE.js";import{f as u}from"./index-hmndAmaZ.js";import"./index-B39ZNkas.js";import"./index-D7p5Eoc-.js";import"./index-BNkbnloB.js";import"./index-C_wTxWsF.js";import"./index-CqZh1NEx.js";import"./index-CVrXcT1N.js";import"./index-BvgrfbWo.js";import"./index-DjlhEceD.js";import"./index-CV4kUk7g.js";import"./index-GQyngMHC.js";import"./index-Br16Q-tE.js";import"./index-BlnDAJH2.js";import"./index-ZDUoC70O.js";import"./index-DsnuW-u7.js";import{C as m}from"./index-DATlls-F.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-DCYm8U2k.js";import"./clsx-B-dksMZM.js";import"./index-B8k91cqS.js";import"./useControlled-Kh7KOzPI.js";import"./useButton-DcZoe7g1.js";import"./useRenderElement-BQbCiycg.js";import"./composite-DQn3N0_v.js";import"./useBaseUiId-BP1KBVDm.js";import"./useOpenChangeComplete-Cv_A3jpp.js";import"./index-B7o473QB.js";import"./index-CuCU4ywu.js";import"./isElementDisabled-CwHw_lZC.js";import"./index-DcccOjoR.js";import"./useRender-5o01eIur.js";import"./visuallyHidden-COI6QeQH.js";import"./useValueChanged-CPtaE3-O.js";import"./FieldItemContext-D--9e-7T.js";import"./getPseudoElementBounds-DYGPhbL6.js";import"./element-D-qatSgX.js";import"./composite-Bu3qC0n_.js";import"./react-BRx4GtcZ.js";import"./ToolbarRootContext-DMT3RUJ8.js";import"./CompositeItem-BS0OyaHZ.js";import"./CompositeRoot-B3WNgI_B.js";import"./useLabelableId-C1-TlTgd.js";import"./ToggleGroup-B-9Vf267.js";const{expect:t,fn:d,userEvent:o,waitFor:n,within:B}=__STORYBOOK_MODULE_TEST__,ue={title:"Patterns/ConfirmableDeleteButton",component:m,tags:["new"],parameters:{layout:"centered"},args:{onConfirm:d()}},a={render:i=>c.jsx(u,{className:"flex w-full min-w-[200px] items-end rounded-lg border border-solid border-neutral-border p-4",children:c.jsx(m,{...i})}),play:async({canvasElement:i,args:s})=>{const e=B(i),r=e.getByRole("button",{name:/delete/i});await t(r).toBeVisible(),await t(e.queryByRole("button",{name:/cancel delete/i})).not.toBeInTheDocument(),await o.click(r),await n(()=>{t(e.getByRole("button",{name:/cancel delete/i})).toBeVisible()}),await o.click(e.getByRole("button",{name:/cancel delete/i})),await n(()=>{t(e.getByRole("button",{name:/delete/i})).toBeVisible(),t(e.queryByRole("button",{name:/cancel delete/i})).not.toBeInTheDocument()}),await o.click(e.getByRole("button",{name:/delete/i})),await n(()=>{t(e.getByRole("button",{name:/cancel delete/i})).toBeVisible()});const p=s.onConfirm,l=e.getByRole("button",{name:/^delete$/i});await n(()=>{t(l).toBeVisible()}),await o.click(l),await n(()=>{t(p).toHaveBeenCalledOnce()}),await n(()=>{t(e.getByRole("button",{name:/delete/i})).toBeVisible(),t(e.queryByRole("button",{name:/cancel delete/i})).not.toBeInTheDocument()})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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

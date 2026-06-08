import{j as o,r as b}from"./iframe-BUnym78j.js";import{c as x}from"./utils-DCYm8U2k.js";import{C as d,a as m,b as h}from"./index-D_5WjVwD.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./ToggleGroup-7_ZqpcRz.js";import"./useButton-P9eg-YPj.js";import"./useRenderElement-Ca5MjKVy.js";import"./useControlled-5C_FWl0K.js";import"./useBaseUiId-DDkm6U0i.js";import"./CompositeItem-DbknVT3w.js";import"./composite-BSwB0I7Y.js";import"./CompositeRoot-DNhtb6u4.js";import"./isElementDisabled-CwHw_lZC.js";import"./composite-CZocG8cQ.js";import"./ToolbarRootContext-pHPS9ZKC.js";const{expect:s,fireEvent:C,fn:S,userEvent:f,within:v}=__STORYBOOK_MODULE_TEST__,N={title:"Patterns/ColourSelector",component:h,subcomponents:{ColourSelectorItem:m,ColourSelectorCustom:d},argTypes:{defaultValue:{description:"The initially selected swatch value(s). Pass the `label` of the swatch as a single-element array, e.g. `['Green']`.",control:!1},onValueChange:{description:"Callback fired when the selected swatch changes. Receives `string[]` — read `value[0]` for the selected label."}},args:{onValueChange:S()},parameters:{docs:{description:{component:"A row of colour swatches where exactly one can be selected at a time.\nEach swatch requires a `color` (CSS color value) and accessible `label`."}}}},p=[{color:"#E53E3E",label:"Red"},{color:"#DD6B20",label:"Orange"},{color:"#D69E2E",label:"Yellow"},{color:"#38A169",label:"Green"},{color:"#3182CE",label:"Blue"}],u={render:a=>o.jsx(h,{defaultValue:["Green"],...a,children:p.map(({color:e,label:t})=>o.jsx(m,{value:t,color:e,label:t},t))}),play:async({canvasElement:a})=>{const e=v(a),t=e.getByLabelText("Green"),r=e.getByLabelText("Red");await s(t).toHaveAttribute("data-pressed"),await s(r).not.toHaveAttribute("data-pressed"),await f.click(r),await s(r).toHaveAttribute("data-pressed"),await s(t).not.toHaveAttribute("data-pressed")}},y=()=>{const[a,e]=b.useState("#3182CE");return o.jsx(d,{value:a,onChange:e})},l={render:()=>o.jsx(y,{})},E=()=>{const[a,e]=b.useState("#38A169"),t=p.find(n=>n.color===a)?.label,r=t?[t]:[];return o.jsxs("div",{className:x("flex flex-col gap-4 min-w-[300px]"),children:[o.jsx(h,{value:r,onValueChange:n=>{const c=n[0],w=p.find(g=>g.label===c);w&&e(w.color)},children:p.map(({color:n,label:c})=>o.jsx(m,{value:c,color:n,label:c},c))}),o.jsx(d,{value:a,onChange:e})]})},i={render:()=>o.jsx(E,{}),play:async({canvasElement:a})=>{const e=v(a),t=e.getByLabelText("Green");await s(t).toHaveAttribute("data-pressed");const r=a.querySelector('input[type="color"]');C.change(r,{target:{value:"#ff0000"}}),await s(t).not.toHaveAttribute("data-pressed"),await s(e.getByText("Custom colour: #ff0000")).toBeVisible()}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: args => <ColourSelector defaultValue={['Green']} {...args}>
      {swatches.map(({
      color,
      label
    }) => <ColourSelectorItem key={label} value={label} color={color} label={label} />)}
    </ColourSelector>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const greenSwatch = canvas.getByLabelText('Green');
    const redSwatch = canvas.getByLabelText('Red');
    await expect(greenSwatch).toHaveAttribute('data-pressed');
    await expect(redSwatch).not.toHaveAttribute('data-pressed');
    await userEvent.click(redSwatch);
    await expect(redSwatch).toHaveAttribute('data-pressed');
    await expect(greenSwatch).not.toHaveAttribute('data-pressed');
  }
}`,...u.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <ColourSelectorCustomWithHooks />
}`,...l.parameters?.docs?.source},description:{story:'`ColourSelectorCustom` standalone — a free-form colour picker with a hex label.\nNo interaction test: native `<input type="color">` opens a browser dialog that\ncannot be driven by `userEvent`.',...l.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <CombinedWithHooks />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const greenSwatch = canvas.getByLabelText('Green');
    await expect(greenSwatch).toHaveAttribute('data-pressed');
    const colorInput = canvasElement.querySelector('input[type="color"]') as HTMLInputElement;
    fireEvent.change(colorInput, {
      target: {
        value: '#ff0000'
      }
    });
    await expect(greenSwatch).not.toHaveAttribute('data-pressed');
    await expect(canvas.getByText('Custom colour: #ff0000')).toBeVisible();
  }
}`,...i.parameters?.docs?.source},description:{story:"The combined preset-swatches + custom-picker pattern used in dialogs such as\n`EditLevelDialog` and `EditMatrixCellDialog`. When the user picks a colour\noutside the preset list the swatch group deselects entirely (value = []).",...i.parameters?.docs?.description}}};const P=["Default","Custom","Combined"];export{i as Combined,l as Custom,u as Default,P as __namedExportsOrder,N as default};

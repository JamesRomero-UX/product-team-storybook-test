import{R as h}from"./index-OovbyCD5.js";import"./iframe-CGUFCU7f.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-DCYm8U2k.js";import"./index-Ciqn2WuZ.js";import"./clsx-B-dksMZM.js";import"./index-0AMcjXiS.js";import"./index-B8k91cqS.js";const{expect:e,fn:u,userEvent:m,within:p}=__STORYBOOK_MODULE_TEST__,d=[{title:"Very Low",value:1,color:"#79B250"},{title:"Low",value:2,color:"#A8D08C"},{title:"Medium",value:3,color:"#F2A041"},{title:"High",value:4,color:"#D25F5F"},{title:"Very High",value:5,color:"#D92B2B"}],k=[{title:"Insignificant",value:1,color:"#79B250"},{title:"Minor",value:2,color:"#A8D08C"},{title:"Moderate",value:3,color:"#F2A041"},{title:"Major",value:4,color:"#D25F5F"},{title:"Severe",value:5,color:"#D92B2B"}],v=[{title:"Minimal Risk",value:1,color:"#79B250",likelihood:1,impact:1},{title:"Minimal Risk",value:1,color:"#79B250",likelihood:1,impact:2},{title:"Minimal Risk",value:1,color:"#79B250",likelihood:1,impact:3},{title:"Minimal Risk",value:1,color:"#79B250",likelihood:2,impact:1},{title:"Minimal Risk",value:1,color:"#79B250",likelihood:2,impact:2},{title:"Minimal Risk",value:1,color:"#79B250",likelihood:3,impact:1},{title:"Low Risk",value:2,color:"#A8D08C",likelihood:1,impact:4},{title:"Low Risk",value:2,color:"#A8D08C",likelihood:2,impact:3},{title:"Low Risk",value:2,color:"#A8D08C",likelihood:2,impact:4},{title:"Low Risk",value:2,color:"#A8D08C",likelihood:3,impact:2},{title:"Low Risk",value:2,color:"#A8D08C",likelihood:3,impact:3},{title:"Low Risk",value:2,color:"#A8D08C",likelihood:4,impact:1},{title:"Low Risk",value:2,color:"#A8D08C",likelihood:4,impact:2},{title:"Low Risk",value:2,color:"#A8D08C",likelihood:5,impact:1},{title:"Low Risk",value:2,color:"#A8D08C",likelihood:5,impact:2},{title:"Moderate Risk",value:3,color:"#F2A041",likelihood:3,impact:4},{title:"Moderate Risk",value:3,color:"#F2A041",likelihood:4,impact:3},{title:"Moderate Risk",value:3,color:"#F2A041",likelihood:5,impact:3},{title:"High Risk",value:4,color:"#D25F5F",likelihood:4,impact:4},{title:"High Risk",value:4,color:"#D25F5F",likelihood:5,impact:4}],f={title:"Patterns/RatingsMatrix",component:h,tags:["wip"],parameters:{layout:"padded"},argTypes:{onCellClick:{action:"cell clicked"}},args:{likelihoodRatings:d,impactRatings:k,matrix:v,inverted:!1,onCellClick:u()}},o={play:async({canvasElement:r,args:s})=>{const t=p(r);for(const n of k)await e(t.getByText(n.title)).toBeInTheDocument();for(const n of d)await e(t.getByText(n.title)).toBeInTheDocument();await e(t.getByText("Impact →")).toBeInTheDocument(),await e(t.getByText("Likelihood ↓")).toBeInTheDocument();const i=t.getAllByText("High Risk");await m.click(i[0]),await e(s.onCellClick).toHaveBeenCalledWith({title:"High Risk",value:4,color:"#D25F5F",likelihood:4,impact:4})}},a={args:{inverted:!0}},c={args:{onCellClick:void 0}},l={play:async({canvasElement:r,args:s})=>{const i=p(r).getAllByText("-");await e(i.length).toBeGreaterThan(0),await m.click(i[0]),await e(s.onCellClick).toHaveBeenCalledWith(e.objectContaining({title:"",value:0,color:"#E0E0E0"}))}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);

    // Verify that all column headers are rendered
    for (const col of defaultImpactRatings) {
      await expect(canvas.getByText(col.title)).toBeInTheDocument();
    }

    // Verify that all row headers are rendered
    for (const row of defaultLikelihoodRatings) {
      await expect(canvas.getByText(row.title)).toBeInTheDocument();
    }

    // Verify the corner label shows default (non-inverted) axis labels
    await expect(canvas.getByText('Impact →')).toBeInTheDocument();
    await expect(canvas.getByText('Likelihood ↓')).toBeInTheDocument();

    // Click the first "High Risk" cell (likelihood=4, impact=4)
    const highRiskCells = canvas.getAllByText('High Risk');
    await userEvent.click(highRiskCells[0]);
    await expect(args.onCellClick).toHaveBeenCalledWith({
      title: 'High Risk',
      value: 4,
      color: '#D25F5F',
      likelihood: 4,
      impact: 4
    });
  }
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    inverted: true
  }
}`,...a.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    onCellClick: undefined
  }
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);

    // Find the empty cells (rendered as "-")
    const emptyCells = canvas.getAllByText('-');
    await expect(emptyCells.length).toBeGreaterThan(0);

    // Click the first empty cell
    await userEvent.click(emptyCells[0]);
    await expect(args.onCellClick).toHaveBeenCalledWith(expect.objectContaining({
      title: '',
      value: 0,
      color: '#E0E0E0'
    }));
  }
}`,...l.parameters?.docs?.source},description:{story:"Tests clicking on an empty cell (no matrix entry) to cover the fallback path.",...l.parameters?.docs?.description}}};const T=["Default","Inverted","NonInteractive","EmptyCellClick"];export{o as Default,l as EmptyCellClick,a as Inverted,c as NonInteractive,T as __namedExportsOrder,f as default};

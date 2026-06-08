import React from "react"
import SegmentedControl from "@risk-smart/themed-cloudscape-components/segmented-control"
import figma from "@figma/code-connect"

figma.connect(SegmentedControl, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-40213", {
  props: {},
  example: () => (
    <SegmentedControl selectedId="option-1" onChange={() => {}} options={[{ text: "Option 1", id: "option-1" }, { text: "Option 2", id: "option-2" }]} />
  ),
})

import React from "react"
import RadioGroup from "@risk-smart/themed-cloudscape-components/radio-group"
import figma from "@figma/code-connect"

figma.connect(RadioGroup, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-40316", {
  props: {},
  example: () => (
    <RadioGroup value="" onChange={() => {}} items={[{ value: "1", label: "Option 1" }, { value: "2", label: "Option 2" }]} />
  ),
})

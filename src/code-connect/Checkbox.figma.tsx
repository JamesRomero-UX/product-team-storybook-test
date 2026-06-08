import React from "react"
import Checkbox from "@risk-smart/themed-cloudscape-components/checkbox"
import figma from "@figma/code-connect"

figma.connect(Checkbox, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-46919", {
  props: {},
  example: () => <Checkbox checked={false} onChange={() => {}}>Label</Checkbox>,
})

import React from "react"
import ToggleButton from "@risk-smart/themed-cloudscape-components/toggle-button"
import figma from "@figma/code-connect"

figma.connect(ToggleButton, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-37201", {
  props: {},
  example: () => <ToggleButton pressed={false} onChange={() => {}}>Label</ToggleButton>,
})

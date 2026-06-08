import React from "react"
import Toggle from "@risk-smart/themed-cloudscape-components/toggle"
import figma from "@figma/code-connect"

figma.connect(Toggle, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-37201", {
  props: {},
  example: () => <Toggle checked={false} onChange={() => {}} />,
})

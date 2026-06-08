import React from "react"
import Popover from "@risk-smart/themed-cloudscape-components/popover"
import figma from "@figma/code-connect"

figma.connect(Popover, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-40920", {
  props: {},
  example: () => <Popover content="Content"><span>Trigger</span></Popover>,
})

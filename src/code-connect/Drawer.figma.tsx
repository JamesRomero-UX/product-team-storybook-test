import React from "react"
import Drawer from "@risk-smart/themed-cloudscape-components/drawer"
import figma from "@figma/code-connect"

figma.connect(Drawer, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-38934", {
  props: {},
  example: () => <Drawer header="Panel title">{/* content */}</Drawer>,
})

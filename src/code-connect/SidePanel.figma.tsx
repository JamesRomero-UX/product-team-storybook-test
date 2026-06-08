import React from "react"
import { SidePanel } from "src/components/side-panel/SidePanel"
import figma from "@figma/code-connect"

figma.connect(SidePanel, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-38934", {
  props: {},
  example: () => <SidePanel />,
})

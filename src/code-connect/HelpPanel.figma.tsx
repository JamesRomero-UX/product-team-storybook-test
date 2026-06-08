import React from "react"
import HelpPanel from "src/components/help-panel/HelpPanel"
import figma from "@figma/code-connect"

figma.connect(HelpPanel, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-45022", {
  props: {},
  example: () => <HelpPanel header={<h2>Help</h2>}>Content</HelpPanel>,
})

import React from "react"
import Textarea from "@risk-smart/themed-cloudscape-components/textarea"
import figma from "@figma/code-connect"

figma.connect(Textarea, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-37564", {
  props: {},
  example: () => <Textarea value="" onChange={() => {}} />,
})

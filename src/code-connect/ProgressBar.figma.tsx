import React from "react"
import ProgressBar from "@risk-smart/themed-cloudscape-components/progress-bar"
import figma from "@figma/code-connect"

figma.connect(ProgressBar, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-40579", {
  props: {},
  example: () => <ProgressBar value={50} />,
})

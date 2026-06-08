import React from "react"
import StatusIndicator from "@risk-smart/themed-cloudscape-components/status-indicator"
import figma from "@figma/code-connect"

figma.connect(StatusIndicator, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-38686", {
  props: {},
  example: () => <StatusIndicator type="success">Active</StatusIndicator>,
})

import React from "react"
import StatusIndicator from "@risk-smart/themed-cloudscape-components/status-indicator"
import figma from "@figma/code-connect"

figma.connect(StatusIndicator, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=300-2908", {
  props: {
    type: figma.enum("Status", { Active: "success", Neutral: "info", Destructive: "error", Warning: "warning" }),
  },
  example: ({ type }) => <StatusIndicator type={type}>Status</StatusIndicator>,
})

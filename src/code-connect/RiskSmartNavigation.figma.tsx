import React from "react"
import RiskSmartNavigation from "@risksmart-app/components/navigation"
import figma from "@figma/code-connect"

// RiskSmartNavigation — the production left navigation bar
figma.connect(RiskSmartNavigation, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-39074", {
  props: {},
  example: () => <RiskSmartNavigation />,
})

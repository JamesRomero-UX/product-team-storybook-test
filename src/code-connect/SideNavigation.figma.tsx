import React from "react"
import SideNavigation from "@risk-smart/themed-cloudscape-components/side-navigation"
import figma from "@figma/code-connect"

figma.connect(SideNavigation, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-39074", {
  props: {},
  example: () => <SideNavigation header={{ text: "RiskSmart", href: "/" }} items={[]} />,
})

import React from "react"
import { PageLayout } from "src/app-shell/Shell"
import figma from "@figma/code-connect"

// PageLayout — RiskSmart App Shell: authenticated layout with SideNavigation + GlobalHeader
figma.connect(PageLayout, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-39074", {
  props: {},
  example: () => (
    <PageLayout>
      {/* page content */}
    </PageLayout>
  ),
})

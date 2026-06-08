import React from "react"
import BreadcrumbGroup from "@risk-smart/themed-cloudscape-components/breadcrumb-group"
import figma from "@figma/code-connect"

figma.connect(BreadcrumbGroup, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-54439", {
  props: {},
  example: () => <BreadcrumbGroup items={[{ text: "Home", href: "/" }, { text: "Page", href: "/page" }]} />,
})

import React from "react"
import TabHeader from "src/components/tab-header"
import figma from "@figma/code-connect"

// TabHeader is the RiskSmart detail page tab header — wraps Cloudscape Header
figma.connect(TabHeader, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-45056", {
  props: {},
  example: () => <TabHeader>Title</TabHeader>,
})

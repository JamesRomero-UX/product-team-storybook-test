import React from "react"
import AppLayout from "@risk-smart/themed-cloudscape-components/app-layout"
import figma from "@figma/code-connect"

figma.connect(AppLayout, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-39074", {
  props: {},
  example: () => <AppLayout content={<></>} />,
})

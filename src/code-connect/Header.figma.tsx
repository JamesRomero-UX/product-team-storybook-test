import React from "react"
import Header from "@risk-smart/themed-cloudscape-components/header"
import figma from "@figma/code-connect"

figma.connect(Header, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-45056", {
  props: {},
  example: () => <Header variant="h1">Page title</Header>,
})

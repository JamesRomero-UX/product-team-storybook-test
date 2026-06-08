import React from "react"
import ColumnLayout from "@risk-smart/themed-cloudscape-components/column-layout"
import figma from "@figma/code-connect"

figma.connect(ColumnLayout, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-46639", {
  props: {},
  example: () => <ColumnLayout columns={2}>{/* children */}</ColumnLayout>,
})

import React from "react"
import Input from "@risk-smart/themed-cloudscape-components/input"
import figma from "@figma/code-connect"

figma.connect(Input, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-41717", {
  props: {},
  example: () => <Input value="" onChange={() => {}} />,
})

import React from "react"
import Form from "@risk-smart/themed-cloudscape-components/form"
import figma from "@figma/code-connect"

figma.connect(Form, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-45120", {
  props: {},
  example: () => <Form>{/* form fields */}</Form>,
})

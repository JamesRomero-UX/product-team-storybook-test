import React from "react"
import Alert from "@risk-smart/themed-cloudscape-components/alert"
import figma from "@figma/code-connect"

figma.connect(Alert, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-54630", {
  props: {},
  example: () => <Alert type="info" header="Title">{/* message */}</Alert>,
})

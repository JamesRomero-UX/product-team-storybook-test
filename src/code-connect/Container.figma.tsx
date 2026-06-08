import React from "react"
import Container from "@risk-smart/themed-cloudscape-components/container"
import figma from "@figma/code-connect"

figma.connect(Container, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-46639", {
  props: {},
  example: () => <Container>{/* content */}</Container>,
})

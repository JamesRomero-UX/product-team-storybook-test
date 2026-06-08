import React from "react"
import Grid from "@risk-smart/themed-cloudscape-components/grid"
import figma from "@figma/code-connect"

figma.connect(Grid, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-46639", {
  props: {},
  example: () => <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>{/* children */}</Grid>,
})

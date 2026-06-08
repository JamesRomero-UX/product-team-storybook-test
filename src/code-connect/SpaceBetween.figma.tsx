import React from "react"
import SpaceBetween from "@risk-smart/themed-cloudscape-components/space-between"
import figma from "@figma/code-connect"

figma.connect(SpaceBetween, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-46639", {
  props: {},
  example: () => <SpaceBetween direction="vertical" size="m">{/* children */}</SpaceBetween>,
})

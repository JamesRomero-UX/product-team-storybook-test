import React from "react"
import Box from "@risk-smart/themed-cloudscape-components/box"
import figma from "@figma/code-connect"

// Box — Cloudscape semantic HTML wrapper
figma.connect(Box, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-46639", {
  props: {},
  example: () => <Box variant="p">{/* content */}</Box>,
})

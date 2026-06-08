import React from "react"
import Divider from "@risk-smart/themed-cloudscape-components/box"
import figma from "@figma/code-connect"

// Cloudscape uses Box with a border for dividers
figma.connect(Divider, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=445-165", {
  props: {},
  example: () => <Box variant="hr" />,
})

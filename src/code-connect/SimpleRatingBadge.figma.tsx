import React from "react"
import SimpleRatingBadge from "src/components/simple-rating-badge"
import figma from "@figma/code-connect"

figma.connect(SimpleRatingBadge, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-38686", {
  props: {},
  example: () => <SimpleRatingBadge rating={{ label: "Low", colour: "green" }} />,
})

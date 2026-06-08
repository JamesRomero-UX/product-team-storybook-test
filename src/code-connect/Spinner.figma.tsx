import React from "react"
import Spinner from "@risk-smart/themed-cloudscape-components/spinner"
import figma from "@figma/code-connect"

figma.connect(Spinner, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-38965", {
  props: {
    size: figma.enum("Size", { Small: "small", Normal: "normal", Big: "big", Large: "large" }),
  },
  example: ({ size }) => <Spinner size={size} />,
})

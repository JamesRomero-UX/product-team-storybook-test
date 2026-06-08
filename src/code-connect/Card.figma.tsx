import React from "react"
import Cards from "@risk-smart/themed-cloudscape-components/cards"
import figma from "@figma/code-connect"

figma.connect(Cards, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-52494", {
  props: {},
  example: () => (
    <Cards items={[]} cardDefinition={{ header: (item) => item }} />
  ),
})

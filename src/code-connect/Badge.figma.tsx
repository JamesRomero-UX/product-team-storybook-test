import React from "react"
import Badge from "@risk-smart/themed-cloudscape-components/badge"
import figma from "@figma/code-connect"

figma.connect(Badge, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=300-2913", {
  props: {
    color: figma.enum("Badge", {
      "Success Badge": "green", "Small success badge": "green",
      "Warning Badge": "yellow", "Small warning badge": "yellow",
      "Destructive Badge": "red", "Small destructive badge": "red",
      "Neutral Badge": "grey", "Small neutral badge": "grey",
      "Primary Badge": "blue", "Small primary badge with icon": "blue",
    }),
    children: figma.textContent("✏️ Button text"),
  },
  example: ({ color, children }) => <Badge color={color}>{children}</Badge>,
})

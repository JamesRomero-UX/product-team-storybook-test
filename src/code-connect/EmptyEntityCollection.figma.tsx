import React from "react"
import EmptyEntityCollection from "src/components/empty-collection/EmptyEntityCollection"
import figma from "@figma/code-connect"

// RiskSmart EmptyEntityCollection — empty state for entity tables/registers
figma.connect(EmptyEntityCollection, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-46639", {
  props: {},
  example: () => <EmptyEntityCollection entityType="risk" />,
})

import React from "react"
import TokenGroup from "@risk-smart/themed-cloudscape-components/token-group"
import figma from "@figma/code-connect"

figma.connect(TokenGroup, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-37085", {
  props: {},
  example: () => <TokenGroup items={[{ label: "Tag 1", dismissLabel: "Remove Tag 1" }]} onDismiss={() => {}} />,
})

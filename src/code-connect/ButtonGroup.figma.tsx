import React from "react"
import ButtonGroup from "@risk-smart/themed-cloudscape-components/button-group"
import figma from "@figma/code-connect"

figma.connect(ButtonGroup, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-54337", {
  props: {},
  example: () => <ButtonGroup variant="icon" items={[{ type: "icon", id: "action", iconName: "add" }]} onItemClick={() => {}} />,
})

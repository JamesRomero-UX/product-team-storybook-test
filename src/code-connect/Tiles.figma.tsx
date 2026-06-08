import React from "react"
import Tiles from "@risk-smart/themed-cloudscape-components/tiles"
import figma from "@figma/code-connect"

figma.connect(Tiles, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-37465", {
  props: {},
  example: () => <Tiles value="" onChange={() => {}} items={[{ value: "1", label: "Option 1" }]} />,
})

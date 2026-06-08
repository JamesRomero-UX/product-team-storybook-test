import React from "react"
import Flashbar from "@risk-smart/themed-cloudscape-components/flashbar"
import figma from "@figma/code-connect"

figma.connect(Flashbar, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-45437", {
  props: {},
  example: () => <Flashbar items={[{ type: "info", content: "Message", id: "1" }]} />,
})

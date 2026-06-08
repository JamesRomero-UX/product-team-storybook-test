import React from "react"
import ButtonDropdown from "@risk-smart/themed-cloudscape-components/button-dropdown"
import figma from "@figma/code-connect"

figma.connect(ButtonDropdown, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-45575", {
  props: {},
  example: () => (
    <ButtonDropdown items={[{ id: "action", text: "Action" }]}>Actions</ButtonDropdown>
  ),
})

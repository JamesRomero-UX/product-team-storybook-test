import React from "react"
import ActionsButton from "src/components/actions-button"
import figma from "@figma/code-connect"

figma.connect(ActionsButton, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-54243", {
  props: {},
  example: () => (
    <ActionsButton items={[{ id: "edit", text: "Edit" }, { id: "delete", text: "Delete" }]} />
  ),
})

import React from "react"
import AttributeEditor from "@risk-smart/themed-cloudscape-components/attribute-editor"
import figma from "@figma/code-connect"

figma.connect(AttributeEditor, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-54520", {
  props: {},
  example: () => <AttributeEditor items={[]} definition={[]} onAddButtonClick={() => {}} />,
})

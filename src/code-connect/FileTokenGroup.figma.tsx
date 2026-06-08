import React from "react"
import FileTokenGroup from "@risk-smart/themed-cloudscape-components/file-token-group"
import figma from "@figma/code-connect"

figma.connect(FileTokenGroup, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-37085", {
  props: {},
  example: () => <FileTokenGroup items={[]} onDismiss={() => {}} />,
})

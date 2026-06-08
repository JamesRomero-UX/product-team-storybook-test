import React from "react"
import FileInput from "@risk-smart/themed-cloudscape-components/file-input"
import figma from "@figma/code-connect"

figma.connect(FileInput, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-45458", {
  props: {},
  example: () => <FileInput onChange={() => {}}>Browse</FileInput>,
})

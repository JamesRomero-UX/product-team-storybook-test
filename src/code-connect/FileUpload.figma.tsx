import React from "react"
import FileUpload from "@risk-smart/themed-cloudscape-components/file-upload"
import figma from "@figma/code-connect"

figma.connect(FileUpload, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-45458", {
  props: {},
  example: () => <FileUpload value={[]} onChange={() => {}} />,
})

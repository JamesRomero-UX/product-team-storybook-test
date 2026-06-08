import React from "react"
import FileDropzone from "@risk-smart/themed-cloudscape-components/file-dropzone"
import figma from "@figma/code-connect"

figma.connect(FileDropzone, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-45458", {
  props: {},
  example: () => <FileDropzone onChange={() => {}}><span>Drop files here</span></FileDropzone>,
})

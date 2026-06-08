import React from "react"
import CopyToClipboard from "@risk-smart/themed-cloudscape-components/copy-to-clipboard"
import figma from "@figma/code-connect"

figma.connect(CopyToClipboard, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-46609", {
  props: {},
  example: () => <CopyToClipboard copyButtonText="Copy" textToCopy="value" />,
})

import React from "react"
import TextContent from "@risk-smart/themed-cloudscape-components/text-content"
import figma from "@figma/code-connect"

figma.connect(TextContent, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-46639", {
  props: {},
  example: () => <TextContent><p>Content</p></TextContent>,
})

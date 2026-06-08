import React from "react"
import TagEditor from "@risk-smart/themed-cloudscape-components/tag-editor"
import figma from "@figma/code-connect"

figma.connect(TagEditor, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-37580", {
  props: {},
  example: () => <TagEditor tags={[]} onChange={() => {}} />,
})

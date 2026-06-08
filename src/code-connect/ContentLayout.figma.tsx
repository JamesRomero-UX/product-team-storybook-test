import React from "react"
import ContentLayout from "@risk-smart/themed-cloudscape-components/content-layout"
import figma from "@figma/code-connect"

figma.connect(ContentLayout, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-46639", {
  props: {},
  example: () => <ContentLayout header={<></>}>{/* content */}</ContentLayout>,
})

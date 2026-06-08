import React from "react"
import EmptyCollection from "src/components/empty-collection/EmptyCollection"
import figma from "@figma/code-connect"

figma.connect(EmptyCollection, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-46639", {
  props: {},
  example: () => <EmptyCollection />,
})

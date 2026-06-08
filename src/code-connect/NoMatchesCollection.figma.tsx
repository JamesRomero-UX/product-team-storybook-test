import React from "react"
import NoMatchesCollection from "src/components/empty-collection/NoMatchesCollection"
import figma from "@figma/code-connect"

figma.connect(NoMatchesCollection, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-46639", {
  props: {},
  example: () => <NoMatchesCollection />,
})

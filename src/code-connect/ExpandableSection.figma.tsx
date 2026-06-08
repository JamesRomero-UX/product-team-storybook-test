import React from "react"
import ExpandableSection from "@risk-smart/themed-cloudscape-components/expandable-section"
import figma from "@figma/code-connect"

figma.connect(ExpandableSection, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-45540", {
  props: {},
  example: () => <ExpandableSection headerText="Section title">{/* content */}</ExpandableSection>,
})

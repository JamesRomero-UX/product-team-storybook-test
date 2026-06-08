import React from "react"
import MixedLineBarChart from "@risk-smart/themed-cloudscape-components/mixed-line-bar-chart"
import figma from "@figma/code-connect"

figma.connect(MixedLineBarChart, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-49660", {
  props: {},
  example: () => <MixedLineBarChart series={[]} xDomain={[]} yDomain={[0, 100]} />,
})

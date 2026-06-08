import React from "react"
import BarChart from "@risk-smart/themed-cloudscape-components/bar-chart"
import figma from "@figma/code-connect"

figma.connect(BarChart, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-47081", {
  props: {},
  example: () => <BarChart series={[]} xDomain={[]} yDomain={[0, 100]} />,
})

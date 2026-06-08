import React from "react"
import AreaChart from "@risk-smart/themed-cloudscape-components/area-chart"
import figma from "@figma/code-connect"

figma.connect(AreaChart, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-49938", {
  props: {},
  example: () => <AreaChart series={[]} xDomain={[]} yDomain={[0, 100]} />,
})

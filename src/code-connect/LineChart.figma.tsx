import React from "react"
import LineChart from "@risk-smart/themed-cloudscape-components/line-chart"
import figma from "@figma/code-connect"

figma.connect(LineChart, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-49114", {
  props: {},
  example: () => <LineChart series={[]} xDomain={[]} yDomain={[0, 100]} />,
})

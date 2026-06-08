import React from "react"
import PieChart from "@risk-smart/themed-cloudscape-components/pie-chart"
import figma from "@figma/code-connect"

figma.connect(PieChart, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-50601", {
  props: {},
  example: () => <PieChart data={[]} />,
})

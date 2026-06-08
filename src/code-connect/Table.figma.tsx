import React from "react"
import Table from "@risk-smart/themed-cloudscape-components/table"
import figma from "@figma/code-connect"

figma.connect(Table, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-38660", {
  props: {},
  example: () => <Table items={[]} columnDefinitions={[]} />,
})

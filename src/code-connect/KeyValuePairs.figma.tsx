import React from "react"
import KeyValuePairs from "@risk-smart/themed-cloudscape-components/key-value-pairs"
import figma from "@figma/code-connect"

figma.connect(KeyValuePairs, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-41519", {
  props: {},
  example: () => <KeyValuePairs columns={2} items={[{ label: "Key", value: "Value" }]} />,
})

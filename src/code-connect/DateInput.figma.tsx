import React from "react"
import DateInput from "@risk-smart/themed-cloudscape-components/date-input"
import figma from "@figma/code-connect"

figma.connect(DateInput, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-46591", {
  props: {},
  example: () => <DateInput value="" onChange={() => {}} />,
})

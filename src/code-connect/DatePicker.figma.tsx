import React from "react"
import DatePicker from "@risk-smart/themed-cloudscape-components/date-picker"
import figma from "@figma/code-connect"

figma.connect(DatePicker, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-46569", {
  props: {},
  example: () => <DatePicker value="" onChange={() => {}} />,
})

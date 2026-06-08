import React from "react"
import DateRangePicker from "@risk-smart/themed-cloudscape-components/date-range-picker"
import figma from "@figma/code-connect"

figma.connect(DateRangePicker, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-46519", {
  props: {},
  example: () => <DateRangePicker value={null} onChange={() => {}} relativeOptions={[]} isValidRange={() => ({ valid: true })} />,
})

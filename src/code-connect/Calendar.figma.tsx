import React from "react"
import Calendar from "@risk-smart/themed-cloudscape-components/calendar"
import figma from "@figma/code-connect"

figma.connect(Calendar, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-52762", {
  props: {},
  example: () => <Calendar value="" onChange={() => {}} />,
})

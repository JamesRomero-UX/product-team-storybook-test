import React from "react"
import Multiselect from "@risk-smart/themed-cloudscape-components/multiselect"
import figma from "@figma/code-connect"

figma.connect(Multiselect, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-41087", {
  props: {},
  example: () => <Multiselect selectedOptions={[]} onChange={() => {}} options={[]} />,
})

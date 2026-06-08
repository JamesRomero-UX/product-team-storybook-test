import React from "react"
import Autosuggest from "@risk-smart/themed-cloudscape-components/autosuggest"
import figma from "@figma/code-connect"

figma.connect(Autosuggest, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-39918", {
  props: {},
  example: () => <Autosuggest value="" onChange={() => {}} options={[]} enteredTextLabel={(v) => v} />,
})

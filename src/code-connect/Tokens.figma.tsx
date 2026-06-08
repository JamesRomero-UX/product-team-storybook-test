import React from "react"
import Tokens from "src/components/tokens"
import figma from "@figma/code-connect"

// RiskSmart Tokens — multiselect token chips shown in forms (Owner, Tags, etc.)
figma.connect(Tokens, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-37085", {
  props: {},
  example: () => <Tokens selectedOptions={[]} onChange={() => {}} options={[]} />,
})

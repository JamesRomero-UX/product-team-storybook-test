import React from "react"
import Button from "@risk-smart/themed-cloudscape-components/button"
import figma from "@figma/code-connect"

figma.connect(Button, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-54337", {
  props: {
    variant: figma.enum("Type", { Primary: "primary", Secondary: "normal", Alert: "normal", "Link button": "link" }),
    disabled: figma.enum("State", { Default: false, Disabled: true, Loading: false }),
    loading: figma.enum("State", { Default: false, Disabled: false, Loading: true }),
    children: figma.textContent("✏️ Button text"),
  },
  example: ({ variant, disabled, loading, children }) => (
    <Button variant={variant} disabled={disabled} loading={loading}>{children}</Button>
  ),
})

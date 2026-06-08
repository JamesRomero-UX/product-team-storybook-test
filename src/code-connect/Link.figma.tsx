import React from "react"
import Link from "@risk-smart/themed-cloudscape-components/link"
import figma from "@figma/code-connect"

figma.connect(Link, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-41370", {
  props: {},
  example: () => <Link href="#">Link text</Link>,
})

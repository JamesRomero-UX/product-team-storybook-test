import React from "react"
import Icon from "@risk-smart/themed-cloudscape-components/icon"
import figma from "@figma/code-connect"

figma.connect(Icon, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-41946", {
  props: {
    name: figma.enum("Name", { Add: "add", Copy: "copy", External: "external", Menu: "menu", Refresh: "refresh", Settings: "settings" }),
  },
  example: ({ name }) => <Icon name={name} />,
})

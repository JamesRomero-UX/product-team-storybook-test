import React from "react"
import Modal from "@risk-smart/themed-cloudscape-components/modal"
import figma from "@figma/code-connect"

figma.connect(Modal, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-41352", {
  props: {},
  example: () => <Modal visible onDismiss={() => {}} header="Title">{/* content */}</Modal>,
})

import React from "react"
import ConfirmModal from "src/components/confirm-modal/ConfirmModal"
import figma from "@figma/code-connect"

figma.connect(ConfirmModal, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-41352", {
  props: {},
  example: () => <ConfirmModal visible onDismiss={() => {}} header="Confirm" />,
})

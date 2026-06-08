import React from "react"
import Wizard from "@risk-smart/themed-cloudscape-components/wizard"
import figma from "@figma/code-connect"

figma.connect(Wizard, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-36694", {
  props: {},
  example: () => <Wizard steps={[{ title: "Step 1", content: <></> }]} activeStepIndex={0} onNavigate={() => {}} />,
})

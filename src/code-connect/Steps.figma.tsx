import React from "react"
import Steps from "@risk-smart/themed-cloudscape-components/steps"
import figma from "@figma/code-connect"

figma.connect(Steps, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-36694", {
  props: {},
  example: () => <Steps steps={[{ title: "Step 1" }, { title: "Step 2" }]} activeStepIndex={0} />,
})

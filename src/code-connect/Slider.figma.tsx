import React from "react"
import Slider from "@risk-smart/themed-cloudscape-components/slider"
import figma from "@figma/code-connect"

figma.connect(Slider, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-36879", {
  props: {},
  example: () => <Slider value={50} onChange={() => {}} min={0} max={100} />,
})

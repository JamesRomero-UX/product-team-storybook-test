import React from "react"
import PromptInput from "@risk-smart/themed-cloudscape-components/prompt-input"
import figma from "@figma/code-connect"

figma.connect(PromptInput, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-41717", {
  props: {},
  example: () => <PromptInput value="" onChange={() => {}} actionButtonIconName="send" onAction={() => {}} />,
})

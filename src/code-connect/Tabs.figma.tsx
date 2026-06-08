import React from "react"
import Tabs from "@risk-smart/themed-cloudscape-components/tabs"
import figma from "@figma/code-connect"

figma.connect(Tabs, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-37777", {
  props: {},
  example: () => (
    <Tabs
      activeTabId="tab1"
      onChange={() => {}}
      tabs={[
        { id: "tab1", label: "Tab 1", content: <></> },
        { id: "tab2", label: "Tab 2", content: <></> },
      ]}
    />
  ),
})

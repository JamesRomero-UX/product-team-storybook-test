import React from "react"
import Pagination from "@risk-smart/themed-cloudscape-components/pagination"
import figma from "@figma/code-connect"

figma.connect(Pagination, "https://www.figma.com/design/S7MbVrCl4gp6CrFtIa7LZ5/RS_Shadcn_Tailwind_Design_System?node-id=1624-41069", {
  props: {},
  example: () => <Pagination currentPageIndex={1} pagesCount={5} onChange={() => {}} />,
})

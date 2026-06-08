# Customisable Ribbons

## Overview

Customisable Ribbons are a feature that allow users to customise and save the quick filters that are displayed above a table.
As of writing (01/09/2024) the dashboard can only be saved by admin users and saved at the org level. This means users cannot currently save their own customisable ribbons.

![Customisable Ribbon example](./imgs/customisable-ribbons-preview.png)

## Go to → [CustomisableRibbons](../packages/web/src/components/customisable-ribbon/CustomisableRibbon.tsx)

## Notes

Customisable Ribbons are:

- Configured by:
  - Page Config: `packages/web/src/pages/{ENTITY_NAME}/config.tsx`
  - Widget Data Source: `packages/web/src/pages/dashboards/UniversalWidget/data-sources/{ENTITY_NAME}.ts`
- Custom dropdown forms configured in `components/date-time-filter/dateFilterOperator.ts` which is then used by the `dateColumn` utility
- Imported into the `pages/{ENTITY_NAME}/Page.tsx` file

## Known Issues

- Runtime error when selecting a property that uses a relative date time filter
  - Select a property that uses a relative date time filter
  - Click on the filter to edit
  - Click the dropdown under the label 'Property'
  - Scroll up to the top and select the 'All Properties' option
  - The value will not be cleared which will cause the date object to be cast to a string
  - Click this and it will cause a runtime error
  - **SOLUTION:** Update Cloudscape to fix this issue

![Customisable Ribbon error](./imgs/customisable-ribbons-error.png)

- Adding a custom date filter field to an issue table introduces runtime errors when combined with a clickthrough filter
- Last / Next {TIME_PERIOD} filters don't include today's date

## Architecture

_To view native mermaid diagrams in markdown files, you can use the Mermaid Plugin_

```mermaid
flowchart TD
  subgraph srcDir[web/src]
    issuesDir
    schemasDir
    componentsDir
    utilsDir
  end
  srcDir:::Dir

  subgraph Hasura
    Database:::ts
    CustomisableRibbonSaveAction{{save ribbon\nprefs to hasura}}:::Dir
  end
  Hasura:::Dir

  subgraph issuesDir[pages/issues]
    config:::risksmartcomponent
    Page:::risksmartcomponent
  end
  issuesDir:::Dir

  subgraph schemasDir[schemas]
    customisableRibbonModalSchema:::ts
  end
  schemasDir:::Dir

  subgraph utilsDir[utils/table/utils]
    dateColumn:::ts
  end
  utilsDir:::Dir

  subgraph componentsDir[components]
    CustomisableRibbonDir
    FormDir
    PropertyFilterPanelDir
    DateTimeFilterDir
    ReactHookFormDir
  end
  componentsDir:::Dir

  subgraph DateTimeFilterDir[DateTimeFilter]
    dateFilterOperator:::ts
    RelativeDateTimeForm:::risksmartcomponent
    DateTimeForm:::risksmartcomponent
    DateTimeFormImport{{imported as cloudscape\ncustom form overrides}}:::Dir
  end
  DateTimeFilterDir:::Dir

  subgraph CustomisableRibbonDir[CustomisableRibbon]
    defaultFilters:::ts
    CustomisableRibbon:::risksmartcomponent
    CustomisableRibbonForm:::risksmartcomponent
    CustomisableRibbonFormFields:::risksmartcomponent
  end
  CustomisableRibbonDir:::Dir

  subgraph FormDir[Form]
    ModalForm:::risksmartcomponent
  end
  FormDir:::Dir

  subgraph PropertyFilterPanelDir[PropertyFilterPanel]
    PropertyFilterPanel:::risksmartcomponent
  end
  PropertyFilterPanelDir:::Dir

  subgraph Cloudscape
    PropertyFilter:::cloudscape
    DateRangePicker:::cloudscape
  end

  subgraph ReactHookFormDir[React Hook Form]
    Controller:::reacthookform
  end


  DateTimeForm -.-> DateTimeFormImport
  RelativeDateTimeForm -.-> DateTimeFormImport
  DateTimeFormImport -.-> dateFilterOperator
  dateFilterOperator --> dateColumn
  dateColumn --> config
  config -. import table\ncolumn config .-> Page
  Page --> CustomisableRibbon
  defaultFilters -. config .-> customisableRibbonModalSchema
  customisableRibbonModalSchema -. import schema .-> CustomisableRibbon
  CustomisableRibbon --> ModalForm
  ModalForm --> CustomisableRibbonForm
  CustomisableRibbonForm --> CustomisableRibbonFormFields
  CustomisableRibbonFormFields --> Controller
  Controller --> PropertyFilterPanel
  PropertyFilterPanel --> PropertyFilter
  RelativeDateTimeForm --> DateRangePicker

  CustomisableRibbon --> CustomisableRibbonSaveAction
  CustomisableRibbonSaveAction --> Database

  classDef Dir fill:transparent
  classDef risksmartcomponent fill:#0ff,color:#000
  classDef ts fill:#06f,color:#fff
  classDef reacthookform fill:#EC5990
  classDef cloudscape fill:#f90,color:#000
```

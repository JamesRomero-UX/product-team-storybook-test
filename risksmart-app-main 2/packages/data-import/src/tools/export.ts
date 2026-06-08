import 'dotenv/config';

import type { ApolloError } from '@apollo/client';
import { program } from 'commander';
import dayjs from 'dayjs';
import _ from 'lodash';

import type {
  ActionStatusEnum,
  ConsequenceTypeEnum,
  CostTypeEnum,
  GetFormConfigurationQuery,
} from '../../generated/graphql';
import {
  exportIssues,
  exportLinkedRisksAndControlNames,
  exportNormalised,
  exportUsers,
} from '../graphqlClient';
import { writeFile } from '../services/csvWriter';
import { getEnv } from '../utils/environment';
import { flattenJSON, getCustomAttributeLabels } from './exportUtils';

program.requiredOption(
  '-d, --dir <type>',
  'Path where the data will be exported to'
);
program.requiredOption('-q, --query <type>', 'Query to run');
program.requiredOption(
  '-f, --from <type>',
  'Date from',
  dayjs().subtract(3, 'months').format('YYYY-MM-DD')
);
program.requiredOption(
  '-t, --to <type>',
  'Date to',
  dayjs().format('YYYY-MM-DD')
);
program.parse();

const options = program.opts();
const csvDirectory = options.dir;
const query = options.query;
const fromDate = dayjs(options.from).toISOString();
const toDate = dayjs(options.to).toISOString();

export type CustomAttributeSchemaData =
  GetFormConfigurationQuery['form_configuration'][number]['customAttributeSchema'];

// Generic padding function.
// Ensure arrays are padded as the CSV writer will only write the count of columns in the first row
const padArray = <T>(items: T[], expectedCount: number, empty: T) => {
  const missingItems = expectedCount - items.length;
  for (let i = 0; i < missingItems; i++) {
    console.log(`padding - count: ${items.length}. Padding: ${i}`);
    items.push(empty);
  }
};

const runExport = async () => {
  console.log('Exporting records');
  console.time('Export time');
  try {
    switch (query) {
      case 'exportNormalised':
        {
          const { data } = await exportNormalised({
            OrgKey: getEnv('ORG_KEY'),
          });

          const customAttributes = _.mapValues(
            _.keyBy(data.form_configuration, 'ParentType'),
            (f) => f.customAttributeSchema
          );

          const customAttributeLabels = _.mapValues(customAttributes, (f) =>
            getCustomAttributeLabels(f)
          );

          await Promise.all(
            Object.getOwnPropertyNames(data).map(async (key) => {
              if (key === '__typename' || key === 'form_configuration') {
                return;
              }

              console.log(
                `Retrieved: ${data[key as keyof typeof data]?.length} ${key}`
              );

              if (!Array.isArray(data[key as keyof typeof data])) {
                return;
              }

              await writeFile(
                csvDirectory,
                `${key}.csv`,
                // @ts-expect-error ???
                data[key as keyof typeof data]?.map((i) => {
                  return flattenJSON(i, {}, '', customAttributeLabels[key]);
                }),
                ['CustomAttributeData'] // Exclude empty CustomAttributeData column as values are already extracted
              );
            })
          );

          console.log(`Export completed successfully.`);
        }
        break;
      case 'exportIssues':
        {
          const { data: issues } = await exportIssues({
            OrgKey: getEnv('ORG_KEY'),
            FromDate: fromDate,
            ToDate: toDate,
          });

          const { data: linkedItems } = await exportLinkedRisksAndControlNames({
            Targets: issues.issue.map((c) => c.Id),
          });

          console.log(`Retrieved: ${issues.issue.length} issues`);
          console.log(
            `Retrieved: ${linkedItems.linked_item.length} linked items`
          );

          let maxRiskCount = 0;
          let maxControlCount = 0;
          let maxActionCount = 0;
          let maxConsequencesCount = 0;
          let maxUpdateCount = 0;

          for (const issue of issues.issue) {
            const linkedRisks = linkedItems.linked_item.filter(
              (li) => li.Target === issue.Id && li.source_risk
            );

            const linkedControls = linkedItems.linked_item.filter(
              (li) => li.Target === issue.Id && li.source_control
            );

            if (linkedControls.length > maxControlCount) {
              maxControlCount = linkedControls.length;
            }

            if (linkedRisks.length > maxRiskCount) {
              maxRiskCount = linkedRisks.length;
            }

            if (issue.consequences.length > maxConsequencesCount) {
              maxConsequencesCount = issue.consequences.length;
            }

            if (issue.actions.length > maxActionCount) {
              maxActionCount = issue.actions.length;
            }

            if (issue.updates.length > maxUpdateCount) {
              maxUpdateCount = issue.updates.length;
            }
          }
          const mappedIssues = issues.issue.map((c) => {
            const controls = linkedItems.linked_item
              .filter((li) => li.Target === c.Id && li.source_control)
              .map((li) => ({
                SequentialId: `C-${li.source_control!.SequentialId}`,
                Id: li.source_control!.Id!,
                Title: li.source_control!.Title,
              }));
            const risks = linkedItems.linked_item
              .filter((li) => li.Target === c.Id && li.source_risk)
              .map((li) => ({
                SequentialId: `R-${li.source_risk!.SequentialId}`,
                Id: li.source_risk!.Id!,
                Title: li.source_risk!.Title,
              }));

            if (c.updates.length != maxUpdateCount) {
              padArray(c.updates, maxUpdateCount, {
                Description: '',
                Id: '',
                ParentIssueId: '',
                CreatedAtTimestamp: '',
                ModifiedAtTimestamp: '',
                Title: '',
                ModifiedByUser: '',
                CreatedByUser: '',
                CustomAttributeData: '',
              });
            }

            if (c.actions.length != maxActionCount) {
              padArray(c.actions, maxActionCount, {
                action: {
                  DateDue: '',
                  DateRaised: '',
                  Description: '',
                  Id: '',
                  Priority: 0,
                  Status: '' as ActionStatusEnum,
                  ModifiedAtTimestamp: '',
                  CreatedAtTimestamp: '',
                  Title: '',
                  CreatedByUser: '',
                  ModifiedByUser: '',
                  ClosedDate: '',
                  CustomAttributeData: '',
                  SequentialId: 0,
                },
              });
            }

            if (c.consequences.length != maxConsequencesCount) {
              padArray(c.consequences, maxConsequencesCount, {
                CostType: '' as CostTypeEnum,
                CostValue: 0,
                Criticality: 0,
                Description: '',
                Id: '',
                ParentIssueId: '',
                ModifiedAtTimestamp: '',
                CreatedAtTimestamp: '',
                Title: '',
                CreatedByUser: '',
                ModifiedByUser: '',
                CustomAttributeData: '',
                Type: '' as ConsequenceTypeEnum,
              });
            }

            if (risks.length != maxRiskCount) {
              padArray(risks, maxRiskCount, {
                SequentialId: '',
                Id: '',
                Title: '',
              });
            }

            if (controls.length != maxControlCount) {
              padArray(controls, maxControlCount, {
                SequentialId: '',
                Id: '',
                Title: '',
              });
            }

            return {
              ...c,
              DateIdentified: dayjs(c.DateIdentified).format('YYYY-MM-DD'),
              DateOccurred: dayjs(c.DateOccurred).format('YYYY-MM-DD'),
              controls: controls,
              risks: risks,
            };
          });

          await writeFile(
            csvDirectory,
            `${query}-${dayjs().toISOString()}.csv`,
            mappedIssues.map((i) => flattenJSON(i))
          );
          console.log(
            `Export completed successfully. Number of records exported: ${issues.issue.length}`
          );
        }
        break;
      case 'exportUsers':
        {
          const { data: users } = await exportUsers({
            OrgKey: getEnv('ORG_KEY'),
          });
          await writeFile(
            csvDirectory,
            `${query}-${dayjs().toISOString()}.csv`,
            users.user.map((i) => flattenJSON(i))
          );
          console.log(
            `Export completed successfully. Number of records exported: ${users.user.length}`
          );
        }
        break;
      default:
        throw new Error(
          'Unsupported export query. Query must be one of: [exportIssues]'
        );
    }
    console.timeEnd('Export time');
  } catch (ex) {
    console.log('Failed');
    console.timeEnd('Export time');
    const error = ex as ApolloError;
    console.log(ex);
    console.log(error.message);
    console.log(error.graphQLErrors);
  }
};

runExport();

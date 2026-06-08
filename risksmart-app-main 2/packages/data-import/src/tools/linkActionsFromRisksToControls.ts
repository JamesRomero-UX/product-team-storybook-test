import 'dotenv/config';

import { getLinkedItems, getRisks, insertLinkedItem } from '../graphqlClient';
import { getEnv } from '../utils/environment';

const OrgKey = getEnv('ORG_KEY');
const validateOnly = getEnv('VALIDATE_ONLY');

(async () => {
  const validationMode = validateOnly.toLowerCase() === 'true';
  console.log(
    `Linking actions to linked controls from risks within org ${OrgKey}. ValidationMode: ${validationMode}`
  );

  const riskData = await getRisks({});
  if (riskData.errors) {
    console.error(riskData.errors);

    return;
  }
  if (!riskData.data || riskData.data.risk.length === 0) {
    console.log('Risks not found');

    return;
  }
  const risks = riskData.data.risk;
  let controlCount = 0;
  let actionCount = 0;
  for (const risk of risks) {
    console.log(`Processing Risk: ${risk.Title} - Id: ${risk.Id}`);
    const linkedItemsData = await getLinkedItems({ Id: risk.Id });
    if (linkedItemsData.errors) {
      console.error(linkedItemsData.errors);

      return;
    }
    if (!linkedItemsData.data || linkedItemsData.data.as_source.length === 0) {
      console.log('No linked items');
    }
    const sourceLinkedItems = linkedItemsData.data.as_source;
    const linkedActionIds = sourceLinkedItems
      .filter((c) => c.target_action && c.target_action.Id)
      .map((c) => c.target_action!.Id);
    console.log(`Found ${linkedActionIds.length} linked actions.`);
    if (linkedActionIds.length === 0) {
      console.log(`No actions to link. Skipping.`);
      continue;
    }
    let riskControlCount = 0;
    for (const linkedItem of sourceLinkedItems) {
      if (linkedItem.target_control && linkedItem.target_control.Id) {
        const controlId = linkedItem.target_control.Id;
        console.log(`Processing linked control ${controlId}`);
        actionCount = actionCount + linkedActionIds.length;
        riskControlCount++;
        if (validationMode) {
          console.log(
            `Validation mode. Would have linked Source: ${controlId} Targets: ${linkedActionIds}`
          );
        } else {
          console.log(
            `Linking Source: ${controlId} Targets: ${linkedActionIds}`
          );
          const result = await insertLinkedItem({
            Source: controlId,
            Targets: linkedActionIds,
          });
          if (!result || result.errors) {
            console.log(`Error linking. ${result.errors}`);
          } else {
            console.log(
              `Created ${result.data?.linkItems?.Links.length} links`
            );
          }
        }
      }
    }
    controlCount = controlCount + riskControlCount;
    if (riskControlCount === 0) {
      console.log(
        `Processed Risk: ${risk.Title} - Id: ${risk.Id}. No links created, ${linkedActionIds.length} actions but ${riskControlCount} controls on this risk.`
      );
    } else {
      console.log(
        `Processed Risk: ${risk.Title} - Id: ${risk.Id}. Linked ${linkedActionIds.length} actions to ${riskControlCount} controls on this risk.`
      );
    }
  }

  console.log(
    `Complete. From ${risks.length} Risks, linked ${controlCount} controls with ${actionCount} actions`
  );
})();

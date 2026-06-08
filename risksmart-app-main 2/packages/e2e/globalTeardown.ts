import { enableEventsForOrg } from './eventProxyClient';
import { OrganizationPool } from './organisationPool';

const tearDown = async () => {
  await Promise.all(OrganizationPool.map((o) => enableEventsForOrg(o.orgKey)));
};
export default tearDown;

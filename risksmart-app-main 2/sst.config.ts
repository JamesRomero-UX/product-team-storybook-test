import { SSTConfig } from 'sst';

import { mergeFilesIntoFolder } from './build-utils';
import { getEnv } from './stacks/environment';
import { EventStack } from './stacks/EventStack';
import { isLocal, isPr } from './stacks/isLocal';
import { Notifications } from './stacks/NotificationsStack';
import { ReportingStack } from './stacks/ReportingStack';
import { RestAPI } from './stacks/RestApiStack';
import { ScimApi } from './stacks/ScimApiStack';
import { Secrets } from './stacks/SecretsStack';
import { SharedInfraStack } from './stacks/SharedInfraStack';
import { getEnvSettings } from './stacks/stageEnv/env';
import { RISKSMART_REGION_PREFIX } from './stacks/constants';
const AWS_REGION = process.env.AWS_REGION ?? '';

export default {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  config(_input) {
    return {
      name: `${RISKSMART_REGION_PREFIX}risksmart-app`,
      region: AWS_REGION,
    };
  },

  async stacks(app) {
    const envSettings = getEnvSettings(app.stage);
    app.setDefaultFunctionProps({
      timeout: '30 seconds',
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
        SENTRY_RELEASE: getEnv('SENTRY_RELEASE', true) ?? '',
        POWERTOOLS_DEV: isLocal(app.stage) ? '1' : '0',
      },
      runtime: 'nodejs22.x',
      architecture: 'arm_64',
      nodejs: {
        sourcemap: true,
      },
      logRetention: envSettings.logRetention,
      hooks: {
        async afterBuild(props, out) {
          if (app.mode === 'deploy') {
            mergeFilesIntoFolder(out, './.build/sourcemaps/var/task');
          }
        },
      },
    });

    if (isLocal(app.stage)) {
      app.setDefaultRemovalPolicy('destroy');
    }

    app.stack(Secrets);
    app.stack(SharedInfraStack);
    app.stack(EventStack);
    app.stack(RestAPI);

    if (!isPr(app.stage)) {
      app.stack(ScimApi);
    }
    for (const tenantSettings of envSettings.tenantSettings) {
      const tenant = tenantSettings.name;
      const tenantRegion = tenantSettings.region;
      if (tenantRegion === app.region) {
        await app.stack(ReportingStack(tenantSettings), {
          id: `Reporting-${tenant}`,
        });
        app.stack(Notifications(tenant), {
          id: `Notifications-${tenant}`,
        });
      }
    }
  },
} satisfies SSTConfig;

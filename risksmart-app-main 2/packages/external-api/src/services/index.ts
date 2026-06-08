import type { IPolicy } from 'cockatiel';

import { withPolicy } from '../circuit-breaker/policy-wrapper';
import type { IClient } from '../clients/client.interface';
import type { IMutationClient } from '../clients/mutation-client.interface';
import type {
  Service,
  ServiceConfig,
  ServiceWithProps,
} from '../types/service';
import { actionMutationService } from './actions/action-mutation.service';
import type { ActionsService } from './actions/actions.service';
import { actionsService } from './actions/actions.service';
import type { AppClientServiceConfig } from './app-clients/app-clients.service';
import { assessmentsService } from './assessments/assessments.service';
import { linkedItemsService } from './common/linked-items.service';
import type { SchemaService } from './common/schema.service';
import { schemaService } from './common/schema.service';
import { departmentGroupsService } from './department-groups/department-groups.service';
import { departmentsService } from './departments/departments.service';
import type { DocumentationServiceConfig } from './documentation/documentation.service';
import { documentationService } from './documentation/documentation.service';
import { enterpriseRisksService } from './enterprise-risks/enterprise-risks.service';
import { impactService } from './impacts/impacts.service';
import { indicatorMutationService } from './indicators/indicator-mutation.service';
import type { IndicatorsService } from './indicators/indicators.service';
import { indicatorsService } from './indicators/indicators.service';
import { issueMutationService } from './issues/issue-mutation.service';
import type { IssuesService } from './issues/issues.service';
import { issuesService } from './issues/issues.service';
import { obligationsService } from './obligations/obligations.service';
import { policiesService } from './policies/policies.service';
import type { ControlsService } from './risks/controls.service';
import { controlsService } from './risks/controls.service';
import { riskMutationService } from './risks/risk-mutation.service';
import type { RisksService } from './risks/risks.service';
import { risksService } from './risks/risks.service';
import { tagsService } from './tags/tags.service';
import { thirdPartyService } from './third-parties/third-parties.service';
import { userGroupsService } from './user-groups/user-groups.service';
import type { UsersService } from './users/users.service';
import { usersService } from './users/users.service';

interface CreateResourceServicesProps {
  policy: IPolicy;
  client: IClient;
  config: ServiceConfig;
}

export const createResourceServices = ({
  policy,
  client,
  config,
}: CreateResourceServicesProps) => {
  const createService = <S extends Service<typeof client>>(service: S) => {
    const newService = service(client, config);

    return Object.fromEntries(
      Object.entries(newService).map(([key, fn]) => [
        key,
        withPolicy(policy, fn),
      ])
    ) as ReturnType<S>;
  };

  const wrappedUsersService = createService(usersService);
  const wrappedDepartmentsService = createService(departmentsService);

  const baseSchemaService = schemaService(
    client,
    wrappedUsersService,
    wrappedDepartmentsService
  );
  const wrappedSchemaService: ReturnType<typeof schemaService> = {
    getResourceSchema: withPolicy(policy, baseSchemaService.getResourceSchema),
    validateAndTransformCustomFields: withPolicy(
      policy,
      baseSchemaService.validateAndTransformCustomFields
    ),
    resolveUpdateCustomAttributeData: withPolicy(
      policy,
      baseSchemaService.resolveUpdateCustomAttributeData
    ),
  };

  return {
    actionsService: createService(actionsService),
    assessmentsService: createService(assessmentsService),
    controlsService: createService(controlsService),
    enterpriseRisksService: createService(enterpriseRisksService),
    impactsService: createService(impactService),
    indicatorsService: createService(indicatorsService),
    issuesService: createService(issuesService),
    linkedItemsService: createService(linkedItemsService),
    obligationsService: createService(obligationsService),
    policiesService: createService(policiesService),
    risksService: createService(risksService),
    schemaService: wrappedSchemaService,
    thirdPartiesService: createService(thirdPartyService),
    usersService: wrappedUsersService,
    userGroupsService: createService(userGroupsService),
    departmentsService: wrappedDepartmentsService,
    departmentGroupsService: createService(departmentGroupsService),
    tagsService: createService(tagsService),
  };
};

export const createAuthService = <
  P,
  S extends ServiceWithProps<P, AppClientServiceConfig>,
>(
  policy: IPolicy,
  service: S,
  props: P,
  config: AppClientServiceConfig
) => {
  const newService = service(props, config);

  return Object.fromEntries(
    Object.entries(newService).map(([key, fn]) => [key, withPolicy(policy, fn)])
  ) as ReturnType<S>;
};

export const createDocumentationService = (
  config: DocumentationServiceConfig
) => {
  return documentationService(config);
};

export type ResourceServices = ReturnType<typeof createResourceServices>;

interface CreateMutationServicesProps {
  mutationClient: IMutationClient;
  risksService: RisksService;
  controlsService: ControlsService;
  indicatorsService: IndicatorsService;
  issuesService: IssuesService;
  usersService: UsersService;
  actionsService: ActionsService;
  schemaService: SchemaService;
}

export const createMutationServices = ({
  mutationClient,
  risksService,
  controlsService,
  indicatorsService,
  issuesService,
  usersService,
  actionsService,
  schemaService,
}: CreateMutationServicesProps) => {
  const actionMutService = actionMutationService({
    mutationClient,
    actionsService,
    issuesService,
    usersService,
    schemaService,
  });

  return {
    riskMutationService: riskMutationService({
      mutationClient,
      risksService,
      usersService,
      schemaService,
    }),
    indicatorMutationService: indicatorMutationService({
      mutationClient,
      indicatorsService,
      risksService,
      controlsService,
      usersService,
      schemaService,
    }),
    issueMutationService: issueMutationService({
      mutationClient,
      issuesService,
      usersService,
      schemaService,
    }),
    actionMutationService: actionMutService,
  };
};

export type MutationServices = ReturnType<typeof createMutationServices>;

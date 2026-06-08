import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { DateInput } from './fields/DateInput';
import { Input } from './fields/Input';
import { MultiSelect } from './fields/MultiSelect';
import { RadioGroup } from './fields/RadioGroup';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

type Status = 'Pending' | 'Closed' | 'Open';

type YesOrNo = 'Yes' | 'No';

export type IssueAssessmentFormFields = {
  issueType: string;
  severity: string;
  status: Status;
  targetCloseDate: string;
  certifiedIndividual: string;
  associatedControls: string[];
  regulatoryBreach: YesOrNo;
  regulationsBreached: string;
  regulationsBreachedIds: string[];
  issueCausedByThirdParty: YesOrNo;
  thirdPartyResponsible: string;
  issueCausedBySystemIssue: YesOrNo;
  systemResponsible: string;
  policyBreach: YesOrNo;
  policiesBreached: string;
  policiesBreachedIds: string[];
  policyOwner: string;
  policyOwnerCommentary: string;
  tags: string[];
  departments: string[];
  reportable: YesOrNo;
  rationale: string;
  actualCloseDate: string;
};

export class IssueAssessmentForm extends BaseForm<IssueAssessmentFormFields> {
  constructor(page: Page) {
    super(page);
    this.fields = {
      issueType: new Select(page, 'issueType'),
      severity: new Select(page, 'severity'),
      status: new RadioGroup(page, 'status'),
      targetCloseDate: new DateInput(page, 'targetCloseDate'),
      actualCloseDate: new DateInput(page, 'actualCloseDate'),
      associatedControls: new MultiSelect(page, 'associatedControls'),
      regulatoryBreach: new RadioGroup(page, 'regulatoryBreach'),
      regulationsBreached: new Input(page, 'regulationsBreached'),
      regulationsBreachedIds: new MultiSelect(page, 'regulationsBreachedIds'),
      policyBreach: new RadioGroup(page, 'policyBreached'),
      policiesBreached: new Input(page, 'policiesBreached'),
      policiesBreachedIds: new MultiSelect(page, 'policiesBreachedIds'),
      reportable: new RadioGroup(page, 'reportable'),
      rationale: new TextArea(page, 'rationale'),
      certifiedIndividual: new Select(page, 'certifiedIndividual'),
      issueCausedByThirdParty: new RadioGroup(page, 'issueCausedByThirdParty'),
      thirdPartyResponsible: new Input(page, 'thirdPartyResponsible'),
      issueCausedBySystemIssue: new RadioGroup(
        page,
        'issueCausedBySystemIssue'
      ),
      policyOwnerCommentary: new TextArea(page, 'policyOwnerCommentary'),
      systemResponsible: new Input(page, 'systemResponsible'),

      policyOwner: new Select(page, 'policyOwner'),
      tags: new MultiSelect(page, 'tags'),
      departments: new MultiSelect(page, 'departments'),
    };
  }
}

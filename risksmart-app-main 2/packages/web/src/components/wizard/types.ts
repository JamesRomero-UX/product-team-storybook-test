export type Step = {
  title: string;
  description: string;
  status?: StepStatus;
  tab?: string;
  showModal?: string;
  controlType?: string;
};

export enum StepStatus {
  Complete = 'complete',
  InProgress = 'inProgress',
  ToDO = 'toDo',
}

export type Risk = { riskId: string; title: string };

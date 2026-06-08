// Storybook stub — used wherever production imports a UI component whose
// presence/absence is gated by a separately-stubbed hook (e.g. AIChatSidePanel
// only renders when useChatStore returns isOpen=true; we stub useChatStore to
// always return isOpen=false, so this component never renders anyway).
import type { FC } from 'react';

const NullComponent: FC<any> = () => null;

export const NullNamed: any = NullComponent;
export const Wizard = NullComponent;
export const WizardButton = NullComponent;
export const SidePanel = NullComponent;
export const HelpPanel = NullComponent;
export const AIChatSidePanel = NullComponent;
export const ChangeRequestLevels = NullComponent;
export const NotificationsList = NullComponent;
export const ActionsButton = NullComponent;
export const AddToEnterpriseRiskModal = NullComponent;
export const DeleteModal = NullComponent;
export const ExportButton = NullComponent;
export const SummaryHelpContent = NullComponent;
export const I18nSummaryHelpContent = NullComponent;
export const CreateAssessmentModal = NullComponent;
export const LinkAssessmentModal = NullComponent;
export const TabSettingsModal = NullComponent;

export default NullComponent;

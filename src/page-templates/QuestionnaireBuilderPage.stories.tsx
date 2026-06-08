// Page Templates / Questionnaire Builder — the design-mode canvas
// for editing a questionnaire template version.
//
// EVERY visible sub-component below is a near-verbatim recreation of
// the production source. Files referenced:
//
//   pages/questionnaire-templates/update/Page.tsx                ← outer shell
//   pages/questionnaire-templates/update/tabs/versions/update/tabs/details/Tab.tsx
//   pages/questionnaire-templates/update/tabs/versions/forms/QuestionnaireTemplateVersionForm.tsx
//   pages/questionnaire-templates/update/tabs/versions/forms/QuestionnaireTemplateVersionFormFields.tsx
//   packages/components/src/form-builder/FormBuilder.tsx          ← canvas
//   packages/components/src/form-builder/drag-and-drop/Container.tsx ← section card
//   packages/components/src/form-builder/drag-and-drop/Item.tsx      ← field row
//   packages/components/src/form-builder/drag-and-drop/Handle.tsx    ← drag handle (drag-indicator icon)
//   packages/components/src/form-builder/FormBuilderAddField.tsx     ← hoverable h3, NOT a button
//   packages/components/src/form-builder/FormBuilderAddSection.tsx   ← dashed-border block
//   packages/components/src/form-edit-button/FormEditButton.tsx      ← Cloudscape icon Button + Edit05
//   packages/components/src/form-builder/renderers/controls/TextControl.tsx
//   packages/components/src/form-builder/renderers/controls/CustomisableControl.tsx
//
// The only things we don't lift are the JsonForms render path, the
// dnd-kit wiring, and the zustand stores — those would pull in 20+
// transitive deps. Everything visible matches production verbatim.

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import CloudscapeButton from '@risk-smart/themed-cloudscape-components/button';
import CloudscapeIcon from '@risk-smart/themed-cloudscape-components/icon';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Header from '@risk-smart/themed-cloudscape-components/header';
import Input from '@risk-smart/themed-cloudscape-components/input';
import Popover from '@risk-smart/themed-cloudscape-components/popover';
import RadioGroup from '@risk-smart/themed-cloudscape-components/radio-group';
import Select from '@risk-smart/themed-cloudscape-components/select';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Textarea from '@risk-smart/themed-cloudscape-components/textarea';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import ControlledTabs from 'src/components/controlled-tabs';
import { Edit05, InfoCircle, Dataflow03 } from '@untitled-ui/icons-react';

import '../cloudscape-reference/_setup';
import { PageLayout, RealProviders } from '../app-shell/Shell';

const meta = {
  title: 'Page Templates/Questionnaire Builder',
  component: PageLayout as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Design-mode canvas for a questionnaire template version. ' +
          'Sub-components (FormEditButton, Handle, FormBuilderAddField, ' +
          'FormBuilderAddSection, CustomisableControl) lifted verbatim ' +
          'from the production form-builder source.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── FormEditButton ──────────────────────────────────────────────────
//
// Production: form-edit-button/FormEditButton.tsx
//   <div onPointerDown={stopPropagation}>
//     <Cloudscape Button variant='icon' iconSvg={<Edit05 className='text-grey500' viewBox='0 0 24 24' width='100%' height='100%' />} />
//   </div>
const FormEditButton = ({ onClick }: { onClick?: () => void }) => (
  <div onPointerDown={(e) => e.stopPropagation()}>
    <CloudscapeButton
      variant={'icon'}
      iconSvg={
        <Edit05
          className={'text-grey500'}
          viewBox={'0 0 24 24'}
          width={'100%'}
          height={'100%'}
        />
      }
      onClick={(e: any) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        onClick?.();
      }}
    />
  </div>
);

// ─── Handle (drag indicator) ─────────────────────────────────────────
//
// Verbatim from form-builder/drag-and-drop/Handle.tsx:
//   <div className='flex h-full hover:cursor-grab active:cursor-grabbing'>
//     <Icon name='drag-indicator' />
//   </div>
const Handle = () => (
  <div
    className={'flex h-full hover:cursor-grab active:cursor-grabbing items-center'}
    role={'button'}
    aria-label={'Drag to reorder'}
  >
    <CloudscapeIcon name={'drag-indicator'} />
  </div>
);

// ─── CustomisableControl wrapper ─────────────────────────────────────
//
// Production: form-builder/renderers/controls/CustomisableControl.tsx
//   <div className='pb-6 w-full' data-testid='customisable-control'>
//     <FormField
//       stretch={true}
//       errorText={dirty ? errors : ''}
//       label={
//         <div className='flex gap-3 items-center'>
//           <div>
//             <div className='flex gap-2'>
//               <div>{label}</div>
//               {required && <div className='font-normal text-red'>*</div>}
//             </div>
//           </div>
//           <div className='flex gap-3'>
//             {description && (
//               <Popover content={description}>
//                 <InfoCircle viewBox='0 0 24 24' />
//               </Popover>
//             )}
//             {showConditional && (
//               <Popover content='This field has conditional logic applied'>
//                 <Dataflow03 />
//               </Popover>
//             )}
//           </div>
//         </div>
//       }
//     >
//       {children}
//     </FormField>
//   </div>
const CustomisableControl = ({
  label,
  description,
  required,
  conditional,
  children,
}: {
  label: string;
  description?: string;
  required?: boolean;
  conditional?: boolean;
  children: React.ReactNode;
}) => (
  <div className={'pb-6 w-full'} data-testid={'customisable-control'}>
    <FormField
      stretch={true}
      label={
        <div className={'flex gap-3 items-center'}>
          <div>
            <div className={'flex gap-2'}>
              <div>{label}</div>
              {required && (
                <div className={'font-normal text-red'}>{'*'}</div>
              )}
            </div>
          </div>
          <div className={'flex gap-3'}>
            {description && (
              <Popover
                size={'large'}
                dismissButton={false}
                triggerType={'custom'}
                content={description}
              >
                <InfoCircle
                  viewBox={'0 0 24 24'}
                  width={16}
                  height={16}
                  className={'text-grey500 cursor-help'}
                />
              </Popover>
            )}
            {conditional && (
              <Popover
                size={'large'}
                dismissButton={false}
                triggerType={'custom'}
                content={'This field has conditional logic applied'}
              >
                <Dataflow03
                  viewBox={'0 0 24 24'}
                  width={16}
                  height={16}
                  className={'text-grey500 cursor-help'}
                />
              </Popover>
            )}
          </div>
        </div>
      }
    >
      {children}
    </FormField>
  </div>
);

// ─── Field renderers ─────────────────────────────────────────────────
//
// Each mirrors the corresponding production control (TextControl,
// TextAreaControl, BooleanControl, DropdownSelectControl) but renders
// inside CustomisableControl rather than wiring into JsonForms.
const ShortText = (p: {
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  conditional?: boolean;
}) => (
  <CustomisableControl {...p}>
    <Input
      value={''}
      onChange={() => undefined}
      placeholder={p.placeholder ?? 'Type a short answer'}
      disabled
    />
  </CustomisableControl>
);

const LongText = (p: {
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  conditional?: boolean;
}) => (
  <CustomisableControl {...p}>
    <Textarea
      value={''}
      onChange={() => undefined}
      placeholder={p.placeholder ?? 'Type a long answer'}
      rows={3}
      disabled
    />
  </CustomisableControl>
);

const SingleSelect = (p: {
  label: string;
  options: string[];
  description?: string;
  required?: boolean;
  conditional?: boolean;
}) => (
  <CustomisableControl {...p}>
    <Select
      selectedOption={null}
      onChange={() => undefined}
      options={p.options.map((o) => ({ label: o, value: o }))}
      placeholder={'Choose one'}
      disabled
    />
  </CustomisableControl>
);

const Radio = (p: {
  label: string;
  options: string[];
  description?: string;
  required?: boolean;
  conditional?: boolean;
}) => (
  <CustomisableControl {...p}>
    <RadioGroup
      value={''}
      onChange={() => undefined}
      items={p.options.map((o) => ({ value: o, label: o }))}
    />
  </CustomisableControl>
);

const YesNo = (p: {
  label: string;
  description?: string;
  required?: boolean;
  conditional?: boolean;
}) => (
  <CustomisableControl {...p}>
    <RadioGroup
      value={''}
      onChange={() => undefined}
      items={[
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ]}
    />
  </CustomisableControl>
);

const FileUpload = (p: {
  label: string;
  description?: string;
  required?: boolean;
  conditional?: boolean;
}) => (
  <CustomisableControl {...p}>
    <Button>{'Choose file'}</Button>
  </CustomisableControl>
);

type FieldDef =
  | { type: 'short'; label: string; placeholder?: string; description?: string; required?: boolean; conditional?: boolean }
  | { type: 'long'; label: string; placeholder?: string; description?: string; required?: boolean; conditional?: boolean }
  | { type: 'single'; label: string; options: string[]; description?: string; required?: boolean; conditional?: boolean }
  | { type: 'radio'; label: string; options: string[]; description?: string; required?: boolean; conditional?: boolean }
  | { type: 'yesno'; label: string; description?: string; required?: boolean; conditional?: boolean }
  | { type: 'file'; label: string; description?: string; required?: boolean; conditional?: boolean };

const renderField = (f: FieldDef) => {
  switch (f.type) {
    case 'short':  return <ShortText {...f} />;
    case 'long':   return <LongText {...f} />;
    case 'single': return <SingleSelect {...f} />;
    case 'radio':  return <Radio {...f} />;
    case 'yesno':  return <YesNo {...f} />;
    case 'file':   return <FileUpload {...f} />;
  }
};

// ─── Item (one field row) ────────────────────────────────────────────
//
// Production: form-builder/drag-and-drop/Item.tsx
//   <div className='flex w-full justify-between items-center gap-4'>
//     <JsonForms ... />                              ← the field preview
//     <div className='flex items-center gap-2'>
//       <FormEditButton />
//       <Handle />
//     </div>
//   </div>
const FieldRow = ({ field }: { field: FieldDef }) => (
  <div className={'flex w-full justify-between items-center gap-4'}>
    <div className={'flex-1 min-w-0'}>{renderField(field)}</div>
    <div className={'flex items-center gap-2'}>
      <FormEditButton />
      <Handle />
    </div>
  </div>
);

// ─── FormBuilderAddField ─────────────────────────────────────────────
//
// Production: form-builder/FormBuilderAddField.tsx
//   <div className='flex w-max p-3 transition hover:cursor-pointer hover:bg-grey150 rounded-md'>
//     <Header variant='h3'>{t('addFieldButtonLabel')}</Header>
//   </div>
//
// i18n key 'formBuilder.formField.addFieldButtonLabel' resolves to "Add Field".
const FormBuilderAddField = ({ onClick }: { onClick?: () => void }) => (
  <div
    className={
      'flex w-max p-3 transition hover:cursor-pointer hover:bg-grey150 rounded-md'
    }
    onClick={onClick}
    role={'button'}
  >
    <Header variant={'h3'}>{'Add Field'}</Header>
  </div>
);

// ─── FormBuilderAddSection ───────────────────────────────────────────
//
// Production: form-builder/FormBuilderAddSection.tsx
//   <FormField stretch={false}>
//     <div className='flex flex-col basis-2/3 rounded-md border-2 border-dashed border-grey text-slate-700 items-center gap-y-4 py-[48px] transition hover:cursor-pointer hover:bg-grey150'>
//       <h1 className='text-grey m-0 font-normal'>+</h1>
//       <h1 className='text-grey m-0 font-semibold'>Add Section</h1>
//     </div>
//   </FormField>
const FormBuilderAddSection = ({ onClick }: { onClick?: () => void }) => (
  <FormField stretch={false}>
    <div
      className={
        'flex flex-col basis-2/3 rounded-md border-2 border-dashed border-grey text-slate-700 items-center gap-y-4 py-[48px] transition hover:cursor-pointer hover:bg-grey150'
      }
      onClick={onClick}
      role={'button'}
    >
      <h1 className={'text-grey m-0 font-normal'}>{'+'}</h1>
      <h1 className={'text-grey m-0 font-semibold'}>{'Add Section'}</h1>
    </div>
  </FormField>
);

// ─── Container (one section) ─────────────────────────────────────────
//
// Production: form-builder/drag-and-drop/Container.tsx
//   <div className='w-full mb-5' data-testid='form-builder-container'>
//     <div className='w-full justify-start'>
//       <FormField stretch={false}>
//         <div className='flex flex-col rounded-md border border-solid border-grey bg-white'>
//           <div className='flex h-full items-center px-4 py-3 border-0 border-b-[1px] border-solid border-grey'>
//             <Header variant='h2'>{label}</Header>
//             <div className='flex gap-2 items-center'>
//               <FormEditButton />
//               <Handle />
//             </div>
//           </div>
//           <div className='flex flex-col gap-y-3 px-4 py-3'>
//             {children}
//             <div className='flex justify-end'>
//               <FormBuilderAddField parentId={id} />
//             </div>
//           </div>
//         </div>
//       </FormField>
//     </div>
//   </div>
type SectionDef = {
  id: string;
  title: string;
  fields: FieldDef[];
};

const SectionContainer = ({ section }: { section: SectionDef }) => (
  <div
    className={'w-full mb-5'}
    data-testid={'form-builder-container'}
  >
    <div className={'w-full justify-start'}>
      <FormField stretch={false}>
        <div
          className={
            'flex flex-col rounded-md border border-solid border-grey bg-white'
          }
        >
          <div
            className={
              'flex h-full items-center px-4 py-3 border-0 border-b-[1px] border-solid border-grey'
            }
          >
            <div className={'flex-1'}>
              <Header variant={'h2'}>{section.title}</Header>
            </div>
            <div className={'flex gap-2 items-center'}>
              <FormEditButton />
              <Handle />
            </div>
          </div>
          <div className={'flex flex-col gap-y-3 px-4 py-3'}>
            {section.fields.map((f, i) => (
              <FieldRow key={`${section.id}-f-${i}`} field={f} />
            ))}
            <div className={'flex justify-end'}>
              <FormBuilderAddField />
            </div>
          </div>
        </div>
      </FormField>
    </div>
  </div>
);

// ─── Sample questionnaire ────────────────────────────────────────────
const sampleSections: SectionDef[] = [
  {
    id: 's1',
    title: 'Company information',
    fields: [
      { type: 'short', label: 'Legal company name', placeholder: 'Acme Ltd.', required: true },
      { type: 'short', label: 'Registration number', placeholder: '0000000', required: true },
      { type: 'short', label: 'Country of incorporation', required: true },
      { type: 'short', label: 'Primary contact email', placeholder: 'compliance@example.com', required: true, description: 'The address we will send security incident notifications to.' },
      {
        type: 'radio',
        label: 'Approximately how many employees do you have?',
        options: ['1–50', '51–200', '201–500', '500+'],
        required: true,
      },
    ],
  },
  {
    id: 's2',
    title: 'Information security',
    fields: [
      {
        type: 'radio',
        label: 'Do you hold a recognised information-security certification?',
        options: ['ISO/IEC 27001', 'SOC 2 Type II', 'Both', 'None of the above'],
        required: true,
      },
      {
        type: 'long',
        label: 'Describe your data-encryption practices at rest and in transit',
        placeholder: 'TLS, AES-256, key rotation, KMS, etc.',
        required: true,
      },
      {
        type: 'radio',
        label: 'How frequently are penetration tests performed?',
        options: [
          'Never',
          'Annually by an external firm',
          'Annually external + quarterly internal',
          'Continuously via bug bounty',
        ],
      },
      {
        type: 'file',
        label: 'Attach your most recent SOC 2 report or equivalent',
        description: 'Only required if you indicated SOC 2 above.',
        conditional: true,
      },
    ],
  },
  {
    id: 's3',
    title: 'Incident response',
    fields: [
      {
        type: 'yesno',
        label: 'Will you notify us of any security incident affecting our data within 24 hours?',
        required: true,
      },
      {
        type: 'long',
        label: 'Describe your incident-response runbook for confirmed data breaches',
        placeholder: 'Roles, escalation paths, timelines, notification procedure',
        required: true,
      },
    ],
  },
];

// ─── Outer chrome ────────────────────────────────────────────────────
//
// PageLayout title = questionnaire template title.
// ControlledTabs container shows Details + Versions tabs; Details tab
// holds the version-form + builder canvas.
//
// QuestionnaireTemplateVersionFormFields lays out:
//   - ControlledInput 'Version' (stretch={false})
//   - <FormBuilder hasEditPermission={!readOnly} />
//
// The Save / Save & Publish / Cancel action bar comes from the
// Form context's actions slot (PageWrapper.tsx).
const BuilderCanvas = ({
  versionNumber = '0.2',
}: {
  versionNumber?: string;
}) => {
  const [version, setVersion] = useState(versionNumber);

  return (
    <div>
      {/* TabHeader equivalent — h2 'Details' */}
      <div className={'py-6'}>
        <Header variant={'h2'}>{'Details'}</Header>
      </div>

      {/* ControlledInput 'Version' — Cloudscape FormField + Input */}
      <FormField
        label={'Version *'}
        description={'Increment from the previous version. e.g. 1.0 → 1.1 for a minor change, 1.0 → 2.0 for a major rewrite.'}
        stretch={false}
      >
        <Input
          value={version}
          onChange={({ detail }) => setVersion(detail.value)}
          placeholder={'1.0'}
        />
      </FormField>

      {/* FormBuilder canvas — DraggableFormDesigner sections then AddSection */}
      <div className={'mt-6'}>
        {sampleSections.map((s) => (
          <SectionContainer key={s.id} section={s} />
        ))}
        <FormBuilderAddSection />
      </div>

      {/* Form actions slot (PageWrapper bottom-right) */}
      <div
        className={
          'mt-8 pt-4 border-0 border-grey150 border-solid border-t-[0.5px] flex justify-end'
        }
      >
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Button variant={'normal'}>{'Cancel'}</Button>
          <Button variant={'normal'}>{'Save draft'}</Button>
          <Button variant={'primary'}>{'Save & Publish'}</Button>
        </SpaceBetween>
      </div>
    </div>
  );
};

const QuestionnaireBuilderPage = () => (
  <RealProviders initialPath={'/third-party/questionnaire/123/versions/456'}>
    <PageLayout
      title={'Vendor Security Assessment'}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Button variant={'normal'}>{'Delete'}</Button>
        </SpaceBetween>
      }
    >
      <ControlledTabs
        variant={'container'}
        activeTabId={'details'}
        tabs={[
          { label: 'Details', id: 'details', content: <BuilderCanvas /> },
          { label: 'Versions', id: 'versions', content: <div className={'p-6 text-grey600'}>{'Versions list (table)'}</div> },
        ]}
      />
    </PageLayout>
  </RealProviders>
);

export const Default: Story = {
  render: () => <QuestionnaireBuilderPage />,
};

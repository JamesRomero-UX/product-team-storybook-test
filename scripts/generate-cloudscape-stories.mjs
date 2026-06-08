// Generates Storybook stories for every renderable component in
// @risk-smart/themed-cloudscape-components.
//
// Each component gets one Default story + 1-3 variant stories where useful.
// Components that need provider context, S3, ace, etc. are skipped and
// reported.

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', 'src', 'cloudscape-reference');

const SKIP = {
  'app-layout': 'requires full app shell context (header + side-nav + content)',
  'app-layout-toolbar': 'requires full app shell context',
  'annotation-context': 'provider used by Hotspot/TutorialPanel',
  hotspot: 'requires AnnotationContext + tutorial state',
  'tutorial-panel': 'requires AnnotationContext + tutorial state',
  i18n: 'provider — wraps other components',
  's3-resource-selector': 'requires S3 configuration + AWS SDK',
  'code-editor': 'requires Ace editor builds + worker setup',
  'split-panel': 'only renders inside AppLayout',
  'anchor-navigation': 'requires scroll-spy context on a long-form page',
  'help-panel': 'renders inside AppLayout; trivial standalone',
  'live-region': 'screen-reader-only, no visible output',
  'tree-view': 'complex node state; not implementing',
  'top-navigation': 'requires full app shell',
  'property-filter': 'complex query state — best inside Table',
  'collection-preferences': 'complex preferences UI — best inside Table',
};

const PASCAL = (s) =>
  s.replace(/(^|-)([a-z])/g, (_, _b, c) => c.toUpperCase());

const banner = (name) =>
  `Real Cloudscape ${name} rendered with RiskSmart theme. 1:1 with live app.`;

const META = (name, layout = 'centered') => `
const meta = {
  title: 'Cloudscape Reference/${name}',
  component: ${name},
  tags: ['cloudscape-real'],
  parameters: {
    layout: '${layout}',
    docs: { description: { component: '${banner(name).replace(/'/g, "\\'")}' } },
  },
} satisfies Meta<typeof ${name}>;

export default meta;

type Story = StoryObj<typeof meta>;
`;

const HEADER = (importStmts) =>
  `import type { Meta, StoryObj } from '@storybook/react-vite';
${importStmts}
import '../_setup';
`;

const FILES = {};

const add = (name, source) => {
  FILES[name] = source;
};

// ─── Simple display ──────────────────────────────────────────────────────────
add('Alert', `${HEADER(`import Alert from '@risk-smart/themed-cloudscape-components/alert';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';`)}
${META('Alert')}
export const Default: Story = { args: { header: 'Heads up', children: 'This is an alert.' } };
export const Types: Story = {
  render: () => (
    <SpaceBetween size={'s'}>
      <Alert type={'info'} header={'Info'}>Informational message.</Alert>
      <Alert type={'success'} header={'Success'}>Operation succeeded.</Alert>
      <Alert type={'warning'} header={'Warning'}>Something to watch.</Alert>
      <Alert type={'error'} header={'Error'}>Something went wrong.</Alert>
    </SpaceBetween>
  ),
};
export const Dismissible: Story = { args: { header: 'Dismissible', dismissible: true, children: 'Click X to dismiss.' } };
`);

add('Badge', `${HEADER(`import Badge from '@risk-smart/themed-cloudscape-components/badge';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';`)}
${META('Badge')}
export const Default: Story = { args: { children: 'New' } };
export const Colors: Story = {
  render: () => (
    <SpaceBetween size={'s'} direction={'horizontal'}>
      <Badge>Default</Badge>
      <Badge color={'blue'}>Blue</Badge>
      <Badge color={'green'}>Green</Badge>
      <Badge color={'red'}>Red</Badge>
      <Badge color={'grey'}>Grey</Badge>
    </SpaceBetween>
  ),
};
`);

add('Box', `${HEADER(`import Box from '@risk-smart/themed-cloudscape-components/box';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';`)}
${META('Box')}
export const Default: Story = { args: { children: 'A flexible Box layout primitive.' } };
export const Variants: Story = {
  render: () => (
    <SpaceBetween size={'s'}>
      <Box variant={'h1'}>H1 heading</Box>
      <Box variant={'h2'}>H2 heading</Box>
      <Box variant={'p'}>Paragraph text</Box>
      <Box variant={'small'}>Small text</Box>
      <Box variant={'code'}>{'code({})'}</Box>
    </SpaceBetween>
  ),
};
`);

add('Button', `${HEADER(`import Button from '@risk-smart/themed-cloudscape-components/button';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';`)}
${META('Button')}
export const Default: Story = { args: { children: 'Click me' } };
export const Variants: Story = {
  render: () => (
    <SpaceBetween size={'s'} direction={'horizontal'}>
      <Button variant={'primary'}>Primary</Button>
      <Button variant={'normal'}>Normal</Button>
      <Button variant={'link'}>Link</Button>
      <Button variant={'icon'} iconName={'settings'} ariaLabel={'Settings'} />
    </SpaceBetween>
  ),
};
export const States: Story = {
  render: () => (
    <SpaceBetween size={'s'} direction={'horizontal'}>
      <Button>Default</Button>
      <Button loading>Loading</Button>
      <Button disabled>Disabled</Button>
    </SpaceBetween>
  ),
};
`);

add('Container', `${HEADER(`import Container from '@risk-smart/themed-cloudscape-components/container';
import Header from '@risk-smart/themed-cloudscape-components/header';`)}
${META('Container')}
export const Default: Story = { args: { children: 'Body of the container.' } };
export const WithHeader: Story = {
  render: () => (<Container header={<Header variant={'h2'}>Container title</Header>}>Body</Container>),
};
export const WithFooter: Story = {
  render: () => (<Container header={<Header variant={'h2'}>Title</Header>} footer={'Footer'}>Body</Container>),
};
`);

add('Header', `${HEADER(`import Button from '@risk-smart/themed-cloudscape-components/button';
import Header from '@risk-smart/themed-cloudscape-components/header';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';`)}
${META('Header')}
export const Default: Story = { args: { children: 'Page title' } };
export const Variants: Story = {
  render: () => (
    <SpaceBetween size={'l'}>
      <Header variant={'h1'}>H1 heading</Header>
      <Header variant={'h2'}>H2 heading</Header>
      <Header variant={'h3'}>H3 heading</Header>
    </SpaceBetween>
  ),
};
export const WithActions: Story = {
  render: () => (
    <Header
      variant={'h1'}
      description={'Manage all risks across the organisation.'}
      counter={'(42)'}
      actions={
        <SpaceBetween size={'xs'} direction={'horizontal'}>
          <Button>Export</Button>
          <Button variant={'primary'}>Create</Button>
        </SpaceBetween>
      }
    >
      Risks
    </Header>
  ),
};
`);

add('Icon', `${HEADER(`import Icon from '@risk-smart/themed-cloudscape-components/icon';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';`)}
${META('Icon')}
export const Default: Story = { args: { name: 'settings' } };
export const Common: Story = {
  render: () => (
    <SpaceBetween size={'s'} direction={'horizontal'}>
      <Icon name={'settings'} />
      <Icon name={'add-plus'} />
      <Icon name={'close'} />
      <Icon name={'edit'} />
      <Icon name={'check'} />
      <Icon name={'external'} />
      <Icon name={'search'} />
      <Icon name={'status-warning'} />
    </SpaceBetween>
  ),
};
`);

add('Link', `${HEADER(`import Link from '@risk-smart/themed-cloudscape-components/link';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';`)}
${META('Link')}
export const Default: Story = { args: { href: '#', children: 'Default link' } };
export const Variants: Story = {
  render: () => (
    <SpaceBetween size={'s'}>
      <Link href={'#'}>Default link</Link>
      <Link href={'#'} variant={'primary'}>Primary link</Link>
      <Link href={'#'} variant={'info'}>Info link</Link>
      <Link href={'https://example.com'} external>External link</Link>
    </SpaceBetween>
  ),
};
`);

add('Spinner', `${HEADER(`import Spinner from '@risk-smart/themed-cloudscape-components/spinner';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';`)}
${META('Spinner')}
export const Default: Story = { args: {} };
export const Sizes: Story = {
  render: () => (
    <SpaceBetween size={'s'} direction={'horizontal'}>
      <Spinner size={'normal'} />
      <Spinner size={'big'} />
      <Spinner size={'large'} />
    </SpaceBetween>
  ),
};
`);

add('StatusIndicator', `${HEADER(`import StatusIndicator from '@risk-smart/themed-cloudscape-components/status-indicator';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';`)}
${META('StatusIndicator')}
export const Default: Story = { args: { children: 'Operational' } };
export const Types: Story = {
  render: () => (
    <SpaceBetween size={'xs'}>
      <StatusIndicator type={'success'}>Success</StatusIndicator>
      <StatusIndicator type={'warning'}>Warning</StatusIndicator>
      <StatusIndicator type={'error'}>Error</StatusIndicator>
      <StatusIndicator type={'info'}>Info</StatusIndicator>
      <StatusIndicator type={'pending'}>Pending</StatusIndicator>
      <StatusIndicator type={'in-progress'}>In progress</StatusIndicator>
      <StatusIndicator type={'stopped'}>Stopped</StatusIndicator>
      <StatusIndicator type={'loading'}>Loading</StatusIndicator>
    </SpaceBetween>
  ),
};
`);

add('TextContent', `${HEADER(`import TextContent from '@risk-smart/themed-cloudscape-components/text-content';`)}
${META('TextContent')}
export const Default: Story = {
  render: () => (
    <TextContent>
      <h1>Heading 1</h1>
      <p>Paragraph with <strong>bold</strong> and <em>italic</em>.</p>
      <ul><li>Item 1</li><li>Item 2</li></ul>
    </TextContent>
  ),
};
`);

add('ColumnLayout', `${HEADER(`import Box from '@risk-smart/themed-cloudscape-components/box';
import ColumnLayout from '@risk-smart/themed-cloudscape-components/column-layout';`)}
${META('ColumnLayout', 'fullscreen')}
export const Default: Story = {
  render: () => (
    <ColumnLayout columns={3} variant={'text-grid'}>
      <div><Box variant={'awsui-key-label'}>Status</Box>Active</div>
      <div><Box variant={'awsui-key-label'}>Owner</Box>Sarah Chen</div>
      <div><Box variant={'awsui-key-label'}>Updated</Box>Today</div>
    </ColumnLayout>
  ),
};
`);

add('Grid', `${HEADER(`import Box from '@risk-smart/themed-cloudscape-components/box';
import Container from '@risk-smart/themed-cloudscape-components/container';
import Grid from '@risk-smart/themed-cloudscape-components/grid';`)}
${META('Grid', 'fullscreen')}
export const Default: Story = {
  render: () => (
    <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
      <Container><Box>Left</Box></Container>
      <Container><Box>Right</Box></Container>
    </Grid>
  ),
};
`);

add('SpaceBetween', `${HEADER(`import Box from '@risk-smart/themed-cloudscape-components/box';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';`)}
${META('SpaceBetween')}
export const Default: Story = {
  render: () => (
    <SpaceBetween size={'m'}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </SpaceBetween>
  ),
};
export const Horizontal: Story = {
  render: () => (
    <SpaceBetween size={'m'} direction={'horizontal'}>
      <Box>A</Box>
      <Box>B</Box>
      <Box>C</Box>
    </SpaceBetween>
  ),
};
`);

add('ContentLayout', `${HEADER(`import Container from '@risk-smart/themed-cloudscape-components/container';
import ContentLayout from '@risk-smart/themed-cloudscape-components/content-layout';
import Header from '@risk-smart/themed-cloudscape-components/header';`)}
${META('ContentLayout', 'fullscreen')}
export const Default: Story = {
  render: () => (
    <ContentLayout header={<Header variant={'h1'} description={'Description'}>Page title</Header>}>
      <Container>Body</Container>
    </ContentLayout>
  ),
};
`);

add('Form', `${HEADER(`import Button from '@risk-smart/themed-cloudscape-components/button';
import Form from '@risk-smart/themed-cloudscape-components/form';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Input from '@risk-smart/themed-cloudscape-components/input';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';`)}
${META('Form', 'fullscreen')}
export const Default: Story = {
  render: () => (
    <Form actions={<Button variant={'primary'}>Submit</Button>}>
      <SpaceBetween size={'l'}>
        <FormField label={'Name'}><Input value={''} onChange={() => {}} /></FormField>
        <FormField label={'Email'}><Input value={''} onChange={() => {}} /></FormField>
      </SpaceBetween>
    </Form>
  ),
};
`);

add('FormField', `${HEADER(`import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Input from '@risk-smart/themed-cloudscape-components/input';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { useState } from 'react';`)}
${META('FormField')}

const Controlled = () => {
  const [v, setV] = useState('');
  return <Input value={v} onChange={({ detail }) => setV(detail.value)} />;
};

export const Default: Story = {
  render: () => (<FormField label={'Risk name'} description={'Short title'}><Controlled /></FormField>),
};
export const States: Story = {
  render: () => (
    <SpaceBetween size={'l'}>
      <FormField label={'Default'}><Controlled /></FormField>
      <FormField label={'With constraint'} constraintText={'Max 32 chars'}><Controlled /></FormField>
      <FormField label={'With error'} errorText={'Required'}><Controlled /></FormField>
    </SpaceBetween>
  ),
};
`);

add('KeyValuePairs', `${HEADER(`import KeyValuePairs from '@risk-smart/themed-cloudscape-components/key-value-pairs';`)}
${META('KeyValuePairs', 'fullscreen')}
export const Default: Story = {
  render: () => (
    <KeyValuePairs columns={3} items={[
      { label: 'Status', value: 'Open' },
      { label: 'Severity', value: 'High' },
      { label: 'Owner', value: 'Sarah Chen' },
      { label: 'Created', value: '2026-01-12' },
      { label: 'Updated', value: 'Today' },
      { label: 'Reviewer', value: 'Tom Patel' },
    ]} />
  ),
};
`);

add('ProgressBar', `${HEADER(`import ProgressBar from '@risk-smart/themed-cloudscape-components/progress-bar';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';`)}
${META('ProgressBar', 'fullscreen')}
export const Default: Story = { args: { value: 60, label: 'Loading' } };
export const Variants: Story = {
  render: () => (
    <SpaceBetween size={'s'}>
      <ProgressBar value={20} label={'20%'} />
      <ProgressBar value={50} label={'50%'} />
      <ProgressBar value={100} label={'Complete'} status={'success'} resultText={'Done'} />
      <ProgressBar value={75} label={'In progress'} additionalInfo={'7.5 of 10 GB'} />
    </SpaceBetween>
  ),
};
`);

add('ExpandableSection', `${HEADER(`import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';`)}
${META('ExpandableSection', 'fullscreen')}
export const Default: Story = { args: { headerText: 'Click to expand', children: 'Hidden content.' } };
export const Variants: Story = {
  render: () => (
    <SpaceBetween size={'s'}>
      <ExpandableSection variant={'default'} headerText={'Default'}>Body</ExpandableSection>
      <ExpandableSection variant={'footer'} headerText={'Footer style'}>Body</ExpandableSection>
      <ExpandableSection variant={'container'} headerText={'Container style'}>Body</ExpandableSection>
    </SpaceBetween>
  ),
};
`);

// ─── Inputs ──────────────────────────────────────────────────────────────────
add('Checkbox', `${HEADER(`import Checkbox from '@risk-smart/themed-cloudscape-components/checkbox';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { useState } from 'react';`)}
${META('Checkbox')}
const Controlled = (props: { children: string; disabled?: boolean }) => {
  const [v, setV] = useState(false);
  return <Checkbox checked={v} onChange={({ detail }) => setV(detail.checked)} disabled={props.disabled}>{props.children}</Checkbox>;
};
export const Default: Story = { render: () => <Controlled>I agree</Controlled> };
export const States: Story = {
  render: () => (
    <SpaceBetween size={'xs'}>
      <Controlled>Default</Controlled>
      <Checkbox checked indeterminate onChange={() => {}}>Indeterminate</Checkbox>
      <Controlled disabled>Disabled</Controlled>
    </SpaceBetween>
  ),
};
`);

add('Toggle', `${HEADER(`import Toggle from '@risk-smart/themed-cloudscape-components/toggle';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { useState } from 'react';`)}
${META('Toggle')}
const Controlled = (props: { children: string; disabled?: boolean }) => {
  const [v, setV] = useState(false);
  return <Toggle checked={v} onChange={({ detail }) => setV(detail.checked)} disabled={props.disabled}>{props.children}</Toggle>;
};
export const Default: Story = { render: () => <Controlled>Toggle me</Controlled> };
export const States: Story = {
  render: () => (
    <SpaceBetween size={'xs'}>
      <Controlled>Default</Controlled>
      <Controlled disabled>Disabled</Controlled>
    </SpaceBetween>
  ),
};
`);

add('ToggleButton', `${HEADER(`import ToggleButton from '@risk-smart/themed-cloudscape-components/toggle-button';
import { useState } from 'react';`)}
${META('ToggleButton')}
const Controlled = () => {
  const [v, setV] = useState(false);
  return <ToggleButton pressed={v} onChange={({ detail }) => setV(detail.pressed)} iconName={'star'} pressedIconName={'star-filled'}>Favorite</ToggleButton>;
};
export const Default: Story = { render: () => <Controlled /> };
`);

add('Input', `${HEADER(`import Input from '@risk-smart/themed-cloudscape-components/input';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { useState } from 'react';`)}
${META('Input')}
const Controlled = (props: { placeholder?: string; type?: 'text' | 'search' | 'password' | 'email' | 'number'; disabled?: boolean; invalid?: boolean }) => {
  const [v, setV] = useState('');
  return <Input value={v} onChange={({ detail }) => setV(detail.value)} placeholder={props.placeholder} type={props.type} disabled={props.disabled} invalid={props.invalid} />;
};
export const Default: Story = { render: () => <Controlled placeholder={'Type here'} /> };
export const Types: Story = {
  render: () => (
    <SpaceBetween size={'s'}>
      <Controlled placeholder={'Text'} type={'text'} />
      <Controlled placeholder={'Search'} type={'search'} />
      <Controlled placeholder={'Email'} type={'email'} />
      <Controlled placeholder={'Number'} type={'number'} />
      <Controlled placeholder={'Password'} type={'password'} />
    </SpaceBetween>
  ),
};
export const States: Story = {
  render: () => (
    <SpaceBetween size={'s'}>
      <Controlled placeholder={'Default'} />
      <Controlled placeholder={'Disabled'} disabled />
      <Controlled placeholder={'Invalid'} invalid />
    </SpaceBetween>
  ),
};
`);

add('Textarea', `${HEADER(`import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Textarea from '@risk-smart/themed-cloudscape-components/textarea';
import { useState } from 'react';`)}
${META('Textarea')}
const Controlled = (p: { disabled?: boolean; invalid?: boolean }) => {
  const [v, setV] = useState('');
  return <Textarea value={v} onChange={({ detail }) => setV(detail.value)} disabled={p.disabled} invalid={p.invalid} placeholder={'Type here…'} />;
};
export const Default: Story = { render: () => <Controlled /> };
export const States: Story = {
  render: () => (
    <SpaceBetween size={'s'}>
      <Controlled />
      <Controlled disabled />
      <Controlled invalid />
    </SpaceBetween>
  ),
};
`);

add('RadioGroup', `${HEADER(`import RadioGroup from '@risk-smart/themed-cloudscape-components/radio-group';
import { useState } from 'react';`)}
${META('RadioGroup')}
const Controlled = () => {
  const [v, setV] = useState('low');
  return <RadioGroup value={v} onChange={({ detail }) => setV(detail.value)} items={[
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical', disabled: true },
  ]} />;
};
export const Default: Story = { render: () => <Controlled /> };
`);

add('Tiles', `${HEADER(`import Tiles from '@risk-smart/themed-cloudscape-components/tiles';
import { useState } from 'react';`)}
${META('Tiles', 'fullscreen')}
const Controlled = () => {
  const [v, setV] = useState('a');
  return <Tiles value={v} onChange={({ detail }) => setV(detail.value)} items={[
    { value: 'a', label: 'Option A', description: 'Best for most users' },
    { value: 'b', label: 'Option B', description: 'Power user mode' },
    { value: 'c', label: 'Option C', description: 'Read-only access' },
  ]} />;
};
export const Default: Story = { render: () => <Controlled /> };
`);

add('Slider', `${HEADER(`import Slider from '@risk-smart/themed-cloudscape-components/slider';
import { useState } from 'react';`)}
${META('Slider', 'fullscreen')}
const Controlled = () => {
  const [v, setV] = useState(50);
  return <Slider value={v} onChange={({ detail }) => setV(detail.value)} min={0} max={100} step={1} />;
};
export const Default: Story = { render: () => <div style={{ width: 400 }}><Controlled /></div> };
`);

add('DateInput', `${HEADER(`import DateInput from '@risk-smart/themed-cloudscape-components/date-input';
import { useState } from 'react';`)}
${META('DateInput')}
const Controlled = () => {
  const [v, setV] = useState('');
  return <DateInput value={v} onChange={({ detail }) => setV(detail.value)} placeholder={'YYYY/MM/DD'} />;
};
export const Default: Story = { render: () => <Controlled /> };
`);

add('DatePicker', `${HEADER(`import DatePicker from '@risk-smart/themed-cloudscape-components/date-picker';
import { useState } from 'react';`)}
${META('DatePicker')}
const Controlled = () => {
  const [v, setV] = useState('');
  return <DatePicker value={v} onChange={({ detail }) => setV(detail.value)} placeholder={'YYYY/MM/DD'} />;
};
export const Default: Story = { render: () => <Controlled /> };
`);

add('TimeInput', `${HEADER(`import TimeInput from '@risk-smart/themed-cloudscape-components/time-input';
import { useState } from 'react';`)}
${META('TimeInput')}
const Controlled = () => {
  const [v, setV] = useState('');
  return <TimeInput value={v} onChange={({ detail }) => setV(detail.value)} format={'hh:mm'} placeholder={'hh:mm'} />;
};
export const Default: Story = { render: () => <Controlled /> };
`);

add('DateRangePicker', `${HEADER(`import DateRangePicker from '@risk-smart/themed-cloudscape-components/date-range-picker';
import { useState } from 'react';`)}
${META('DateRangePicker', 'fullscreen')}
const Controlled = () => {
  const [v, setV] = useState<unknown>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <DateRangePicker value={v as any} onChange={({ detail }) => setV(detail.value)} relativeOptions={[
    { key: 'previous-7-days', amount: 7, unit: 'day', type: 'relative' },
    { key: 'previous-30-days', amount: 30, unit: 'day', type: 'relative' },
  ]} isValidRange={() => ({ valid: true })} />;
};
export const Default: Story = { render: () => <Controlled /> };
`);

add('Calendar', `${HEADER(`import Calendar from '@risk-smart/themed-cloudscape-components/calendar';
import { useState } from 'react';`)}
${META('Calendar')}
const Controlled = () => {
  const [v, setV] = useState('');
  return <Calendar value={v} onChange={({ detail }) => setV(detail.value)} />;
};
export const Default: Story = { render: () => <Controlled /> };
`);

add('Select', `${HEADER(`import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Select, { type SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import { useState } from 'react';`)}
${META('Select')}
const OPTIONS: SelectProps.Option[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];
const Controlled = () => {
  const [v, setV] = useState<SelectProps.Option | null>(null);
  return <Select selectedOption={v} onChange={({ detail }) => setV(detail.selectedOption)} options={OPTIONS} placeholder={'Select severity'} />;
};
export const Default: Story = { render: () => <Controlled /> };
export const InsideFormField: Story = { render: () => <FormField label={'Severity'}><Controlled /></FormField> };
`);

add('Multiselect', `${HEADER(`import Multiselect, { type MultiselectProps } from '@risk-smart/themed-cloudscape-components/multiselect';
import { useState } from 'react';`)}
${META('Multiselect')}
const OPTIONS: MultiselectProps.Option[] = [
  { label: 'Apples', value: 'apples' }, { label: 'Bananas', value: 'bananas' }, { label: 'Cherries', value: 'cherries' },
];
const Controlled = () => {
  const [v, setV] = useState<readonly MultiselectProps.Option[]>([]);
  return <Multiselect selectedOptions={v} onChange={({ detail }) => setV(detail.selectedOptions)} options={OPTIONS} placeholder={'Pick fruit'} />;
};
export const Default: Story = { render: () => <Controlled /> };
`);

add('Autosuggest', `${HEADER(`import Autosuggest from '@risk-smart/themed-cloudscape-components/autosuggest';
import { useState } from 'react';`)}
${META('Autosuggest')}
const Controlled = () => {
  const [v, setV] = useState('');
  return <Autosuggest value={v} onChange={({ detail }) => setV(detail.value)} options={[
    { value: 'Apple' }, { value: 'Banana' }, { value: 'Cherry' },
  ]} placeholder={'Type to search'} />;
};
export const Default: Story = { render: () => <Controlled /> };
`);

add('PromptInput', `${HEADER(`import PromptInput from '@risk-smart/themed-cloudscape-components/prompt-input';
import { useState } from 'react';`)}
${META('PromptInput', 'fullscreen')}
const Controlled = () => {
  const [v, setV] = useState('');
  return <PromptInput value={v} onChange={({ detail }) => setV(detail.value)} placeholder={'Ask me anything'} actionButtonAriaLabel={'Send'} actionButtonIconName={'send'} />;
};
export const Default: Story = { render: () => <Controlled /> };
`);

add('SegmentedControl', `${HEADER(`import SegmentedControl from '@risk-smart/themed-cloudscape-components/segmented-control';
import { useState } from 'react';`)}
${META('SegmentedControl')}
const Controlled = () => {
  const [v, setV] = useState<string | null>('day');
  return <SegmentedControl selectedId={v} onChange={({ detail }) => setV(detail.selectedId)} options={[
    { id: 'day', text: 'Day' }, { id: 'week', text: 'Week' }, { id: 'month', text: 'Month' },
  ]} />;
};
export const Default: Story = { render: () => <Controlled /> };
`);

// ─── Items / collections ─────────────────────────────────────────────────────
add('Tabs', `${HEADER(`import Tabs from '@risk-smart/themed-cloudscape-components/tabs';`)}
${META('Tabs', 'fullscreen')}
const TABS = [
  { id: 'overview', label: 'Overview', content: <p>Overview content.</p> },
  { id: 'controls', label: 'Controls', content: <p>Linked controls.</p> },
  { id: 'history', label: 'History', content: <p>Audit history.</p> },
];
export const Default: Story = { render: () => <Tabs tabs={TABS} /> };
export const Variants: Story = {
  render: () => (
    <>
      <h4>variant=&quot;default&quot;</h4><Tabs tabs={TABS} variant={'default'} />
      <br /><h4>variant=&quot;container&quot;</h4><Tabs tabs={TABS} variant={'container'} />
    </>
  ),
};
`);

add('Pagination', `${HEADER(`import Pagination from '@risk-smart/themed-cloudscape-components/pagination';
import { useState } from 'react';`)}
${META('Pagination')}
const Controlled = (p: { pagesCount?: number; openEnd?: boolean; disabled?: boolean }) => {
  const [pg, setPg] = useState(1);
  return <Pagination currentPageIndex={pg} onChange={({ detail }) => setPg(detail.currentPageIndex)} pagesCount={p.pagesCount ?? 10} openEnd={p.openEnd} disabled={p.disabled} />;
};
export const Default: Story = { render: () => <Controlled /> };
export const ManyPages: Story = { render: () => <Controlled pagesCount={42} /> };
export const OpenEnd: Story = { render: () => <Controlled openEnd /> };
`);

add('BreadcrumbGroup', `${HEADER(`import BreadcrumbGroup from '@risk-smart/themed-cloudscape-components/breadcrumb-group';`)}
${META('BreadcrumbGroup', 'fullscreen')}
export const Default: Story = {
  render: () => <BreadcrumbGroup items={[
    { text: 'Home', href: '#/' },
    { text: 'Risks', href: '#/risks' },
    { text: 'R-001', href: '#' },
  ]} />,
};
`);

add('ButtonDropdown', `${HEADER(`import ButtonDropdown from '@risk-smart/themed-cloudscape-components/button-dropdown';`)}
${META('ButtonDropdown')}
export const Default: Story = {
  render: () => <ButtonDropdown items={[
    { id: 'edit', text: 'Edit' },
    { id: 'duplicate', text: 'Duplicate' },
    { id: 'delete', text: 'Delete', disabled: false },
  ]}>Actions</ButtonDropdown>,
};
export const WithIcons: Story = {
  render: () => <ButtonDropdown items={[
    { id: 'export', text: 'Export', iconName: 'download' },
    { id: 'archive', text: 'Archive', iconName: 'remove' },
  ]} variant={'primary'}>More</ButtonDropdown>,
};
`);

add('ButtonGroup', `${HEADER(`import ButtonGroup from '@risk-smart/themed-cloudscape-components/button-group';`)}
${META('ButtonGroup')}
export const Default: Story = {
  render: () => <ButtonGroup variant={'icon'} items={[
    { type: 'icon-button', id: 'thumbs-up', iconName: 'thumbs-up', text: 'Like' },
    { type: 'icon-button', id: 'thumbs-down', iconName: 'thumbs-down', text: 'Dislike' },
    { type: 'icon-button', id: 'copy', iconName: 'copy', text: 'Copy' },
  ]} />,
};
`);

add('TokenGroup', `${HEADER(`import TokenGroup from '@risk-smart/themed-cloudscape-components/token-group';
import { useState } from 'react';`)}
${META('TokenGroup', 'fullscreen')}
const Controlled = () => {
  const [items, setItems] = useState([
    { label: 'critical' }, { label: 'high' }, { label: 'data-loss' },
  ]);
  return <TokenGroup items={items} onDismiss={({ detail }) => setItems((cur) => cur.filter((_, i) => i !== detail.itemIndex))} />;
};
export const Default: Story = { render: () => <Controlled /> };
`);

add('TagEditor', `${HEADER(`import TagEditor from '@risk-smart/themed-cloudscape-components/tag-editor';
import { useState } from 'react';`)}
${META('TagEditor', 'fullscreen')}
const Controlled = () => {
  const [tags, setTags] = useState([{ key: 'env', value: 'prod', existing: false }]);
  return <TagEditor tags={tags} onChange={({ detail }) => setTags(detail.tags)} i18nStrings={{
    keyPlaceholder: 'Key',
    valuePlaceholder: 'Value',
    addButton: 'Add tag',
    removeButton: 'Remove',
    undoButton: 'Undo',
    undoPrompt: 'Tag will be removed',
    loading: 'Loading',
    keyHeader: 'Key',
    valueHeader: 'Value',
    optional: 'optional',
    keySuggestion: 'Custom',
    valueSuggestion: 'Custom',
    emptyTags: 'No tags',
    tooManyKeysSuggestion: 'Too many keys',
    tooManyValuesSuggestion: 'Too many values',
    keysSuggestionLoading: 'Loading',
    keysSuggestionError: 'Error',
    valuesSuggestionLoading: 'Loading',
    valuesSuggestionError: 'Error',
    emptyKeyError: 'Key required',
    maxKeyCharLengthError: 'Too long',
    maxValueCharLengthError: 'Too long',
    duplicateKeyError: 'Duplicate',
    invalidKeyError: 'Invalid',
    invalidValueError: 'Invalid',
    awsPrefixError: 'No aws: prefix',
    tagLimit: (n) => \`Up to \${n}\`,
    tagLimitReached: () => 'Limit reached',
    tagLimitExceeded: () => 'Exceeded',
    enteredKeyLabel: (k) => \`Use "\${k}"\`,
    enteredValueLabel: (v) => \`Use "\${v}"\`,
  }} />;
};
export const Default: Story = { render: () => <Controlled /> };
`);

add('AttributeEditor', `${HEADER(`import AttributeEditor from '@risk-smart/themed-cloudscape-components/attribute-editor';
import Input from '@risk-smart/themed-cloudscape-components/input';
import { useState } from 'react';`)}
${META('AttributeEditor', 'fullscreen')}
const Controlled = () => {
  const [items, setItems] = useState([{ key: '', value: '' }]);
  return <AttributeEditor
    onAddButtonClick={() => setItems((cur) => [...cur, { key: '', value: '' }])}
    onRemoveButtonClick={({ detail }) => setItems((cur) => cur.filter((_, i) => i !== detail.itemIndex))}
    items={items}
    addButtonText={'Add attribute'}
    removeButtonText={'Remove'}
    definition={[
      { label: 'Key', control: (item, i) => <Input value={item.key} onChange={({ detail }) => setItems((cur) => cur.map((it, idx) => idx === i ? { ...it, key: detail.value } : it))} /> },
      { label: 'Value', control: (item, i) => <Input value={item.value} onChange={({ detail }) => setItems((cur) => cur.map((it, idx) => idx === i ? { ...it, value: detail.value } : it))} /> },
    ]}
    empty={'No attributes'}
  />;
};
export const Default: Story = { render: () => <Controlled /> };
`);

add('Steps', `${HEADER(`import Steps from '@risk-smart/themed-cloudscape-components/steps';`)}
${META('Steps', 'fullscreen')}
export const Default: Story = {
  render: () => <Steps steps={[
    { status: 'success', header: 'Validated input', details: 'All checks passed.' },
    { status: 'success', header: 'Created resource', details: 'Resource ARN: …' },
    { status: 'in-progress', header: 'Configuring permissions' },
    { status: 'loading', header: 'Pending', details: 'Waiting on dependency.' },
  ]} />,
};
`);

// ─── Overlays ────────────────────────────────────────────────────────────────
add('Modal', `${HEADER(`import Box from '@risk-smart/themed-cloudscape-components/box';
import Button from '@risk-smart/themed-cloudscape-components/button';
import Modal from '@risk-smart/themed-cloudscape-components/modal';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { useState } from 'react';`)}
${META('Modal')}
const Demo = (p: { size?: 'small' | 'medium' | 'large' | 'max' }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={'primary'} onClick={() => setOpen(true)}>Open ({p.size ?? 'medium'})</Button>
      <Modal visible={open} onDismiss={() => setOpen(false)} header={'Confirm action'} size={p.size}
        footer={<Box float={'right'}>
          <SpaceBetween size={'xs'} direction={'horizontal'}>
            <Button variant={'link'} onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant={'primary'} onClick={() => setOpen(false)}>Confirm</Button>
          </SpaceBetween>
        </Box>}>Are you sure?</Modal>
    </>
  );
};
export const Default: Story = { render: () => <Demo /> };
export const Sizes: Story = {
  render: () => (
    <SpaceBetween size={'s'} direction={'horizontal'}>
      <Demo size={'small'} /><Demo size={'medium'} /><Demo size={'large'} /><Demo size={'max'} />
    </SpaceBetween>
  ),
};
`);

add('Drawer', `${HEADER(`import Drawer from '@risk-smart/themed-cloudscape-components/drawer';
import Header from '@risk-smart/themed-cloudscape-components/header';`)}
${META('Drawer', 'fullscreen')}
export const Default: Story = {
  render: () => <Drawer header={<Header variant={'h2'}>Details</Header>}>
    <p>Drawer body content. Drawers usually live inside the AppLayout drawers prop.</p>
  </Drawer>,
};
`);

add('Popover', `${HEADER(`import Popover from '@risk-smart/themed-cloudscape-components/popover';
import StatusIndicator from '@risk-smart/themed-cloudscape-components/status-indicator';`)}
${META('Popover')}
export const Default: Story = {
  render: () => <Popover header={'Tooltip'} content={<StatusIndicator type={'info'}>Hover content</StatusIndicator>}>Hover or click me</Popover>,
};
`);

add('Flashbar', `${HEADER(`import Flashbar from '@risk-smart/themed-cloudscape-components/flashbar';`)}
${META('Flashbar', 'fullscreen')}
export const Default: Story = {
  render: () => <Flashbar items={[
    { type: 'success', header: 'Saved', content: 'Your changes are saved.', dismissible: true },
    { type: 'warning', header: 'Heads up', content: 'Some checks pending.', dismissible: true },
    { type: 'error', header: 'Failed', content: 'Could not save.', dismissible: true },
    { type: 'info', header: 'Info', content: 'New version available.', dismissible: true },
  ]} />,
};
`);

add('CopyToClipboard', `${HEADER(`import CopyToClipboard from '@risk-smart/themed-cloudscape-components/copy-to-clipboard';`)}
${META('CopyToClipboard')}
export const Default: Story = {
  render: () => <CopyToClipboard textToCopy={'arn:aws:iam::123456789012:role/risk-admin'} copyButtonText={'Copy ARN'}
    copySuccessText={'Copied'} copyErrorText={'Copy failed'} />,
};
`);

// ─── Charts ──────────────────────────────────────────────────────────────────
add('LineChart', `${HEADER(`import LineChart from '@risk-smart/themed-cloudscape-components/line-chart';`)}
${META('LineChart', 'fullscreen')}
export const Default: Story = {
  render: () => <LineChart series={[
    { title: 'Open risks', type: 'line', data: [
      { x: new Date(2026, 0, 1), y: 12 }, { x: new Date(2026, 1, 1), y: 19 },
      { x: new Date(2026, 2, 1), y: 15 }, { x: new Date(2026, 3, 1), y: 22 },
    ] },
  ]} xDomain={[new Date(2026, 0, 1), new Date(2026, 3, 1)]} yDomain={[0, 30]}
    xTitle={'Month'} yTitle={'Count'} ariaLabel={'Open risks over time'} />,
};
`);

add('BarChart', `${HEADER(`import BarChart from '@risk-smart/themed-cloudscape-components/bar-chart';`)}
${META('BarChart', 'fullscreen')}
export const Default: Story = {
  render: () => <BarChart series={[
    { title: 'Critical', type: 'bar', data: [{ x: 'Q1', y: 4 }, { x: 'Q2', y: 6 }, { x: 'Q3', y: 3 }, { x: 'Q4', y: 7 }] },
    { title: 'High', type: 'bar', data: [{ x: 'Q1', y: 8 }, { x: 'Q2', y: 12 }, { x: 'Q3', y: 9 }, { x: 'Q4', y: 14 }] },
  ]} xDomain={['Q1', 'Q2', 'Q3', 'Q4']} yDomain={[0, 20]} xTitle={'Quarter'} yTitle={'Count'}
    ariaLabel={'Risks by quarter'} stackedBars />,
};
`);

add('AreaChart', `${HEADER(`import AreaChart from '@risk-smart/themed-cloudscape-components/area-chart';`)}
${META('AreaChart', 'fullscreen')}
export const Default: Story = {
  render: () => <AreaChart series={[
    { title: 'Open', type: 'area', data: [
      { x: new Date(2026, 0, 1), y: 12 }, { x: new Date(2026, 1, 1), y: 19 },
      { x: new Date(2026, 2, 1), y: 15 }, { x: new Date(2026, 3, 1), y: 22 },
    ] },
  ]} xDomain={[new Date(2026, 0, 1), new Date(2026, 3, 1)]} yDomain={[0, 30]}
    xTitle={'Month'} yTitle={'Count'} ariaLabel={'Open risks'} />,
};
`);

add('MixedLineBarChart', `${HEADER(`import MixedLineBarChart from '@risk-smart/themed-cloudscape-components/mixed-line-bar-chart';`)}
${META('MixedLineBarChart', 'fullscreen')}
export const Default: Story = {
  render: () => <MixedLineBarChart series={[
    { title: 'Open', type: 'bar', data: [{ x: 'Jan', y: 12 }, { x: 'Feb', y: 19 }, { x: 'Mar', y: 15 }, { x: 'Apr', y: 22 }] },
    { title: 'Trend', type: 'line', data: [{ x: 'Jan', y: 13 }, { x: 'Feb', y: 16 }, { x: 'Mar', y: 17 }, { x: 'Apr', y: 18 }] },
  ]} xDomain={['Jan', 'Feb', 'Mar', 'Apr']} yDomain={[0, 30]} xTitle={'Month'} yTitle={'Count'} ariaLabel={'Risks'} />,
};
`);

add('PieChart', `${HEADER(`import PieChart from '@risk-smart/themed-cloudscape-components/pie-chart';`)}
${META('PieChart', 'fullscreen')}
export const Default: Story = {
  render: () => <PieChart data={[
    { title: 'Critical', value: 4 }, { title: 'High', value: 12 }, { title: 'Medium', value: 18 }, { title: 'Low', value: 22 },
  ]} ariaLabel={'Risks by severity'} hideFilter />,
};
`);

// ─── Files ───────────────────────────────────────────────────────────────────
add('FileInput', `${HEADER(`import FileInput from '@risk-smart/themed-cloudscape-components/file-input';
import { useState } from 'react';`)}
${META('FileInput')}
const Controlled = () => {
  const [files, setFiles] = useState<File[]>([]);
  return <FileInput value={files} onChange={({ detail }) => setFiles(detail.value)} multiple>Choose file</FileInput>;
};
export const Default: Story = { render: () => <Controlled /> };
`);

add('FileUpload', `${HEADER(`import FileUpload from '@risk-smart/themed-cloudscape-components/file-upload';
import { useState } from 'react';`)}
${META('FileUpload', 'fullscreen')}
const Controlled = () => {
  const [files, setFiles] = useState<File[]>([]);
  return <FileUpload value={files} onChange={({ detail }) => setFiles(detail.value)} multiple
    i18nStrings={{
      uploadButtonText: () => 'Choose files',
      dropzoneText: () => 'Drop files here',
      removeFileAriaLabel: (i) => \`Remove file \${i + 1}\`,
      limitShowFewer: 'Show fewer',
      limitShowMore: 'Show more',
      errorIconAriaLabel: 'Error',
    }} />;
};
export const Default: Story = { render: () => <Controlled /> };
`);

add('FileDropzone', `${HEADER(`import FileDropzone from '@risk-smart/themed-cloudscape-components/file-dropzone';
import { useState } from 'react';`)}
${META('FileDropzone', 'fullscreen')}
const Controlled = () => {
  const [files, setFiles] = useState<File[]>([]);
  return <FileDropzone onChange={({ detail }) => setFiles((cur) => [...cur, ...detail.value])}>{files.length === 0 ? 'Drop files here' : \`\${files.length} file(s)\`}</FileDropzone>;
};
export const Default: Story = { render: () => <div style={{ width: 480 }}><Controlled /></div> };
`);

add('FileTokenGroup', `${HEADER(`import FileTokenGroup from '@risk-smart/themed-cloudscape-components/file-token-group';
import { useState } from 'react';`)}
${META('FileTokenGroup', 'fullscreen')}
const SAMPLE = [
  new File(['data'], 'risk-register.pdf', { type: 'application/pdf' }),
  new File(['data'], 'controls.xlsx', { type: 'application/vnd.ms-excel' }),
];
const Controlled = () => {
  const [items, setItems] = useState(SAMPLE.map((file) => ({ file })));
  return <FileTokenGroup items={items} onDismiss={({ detail }) => setItems((cur) => cur.filter((_, i) => i !== detail.fileIndex))}
    i18nStrings={{
      removeFileAriaLabel: (i) => \`Remove file \${i + 1}\`,
      limitShowFewer: 'Show fewer',
      limitShowMore: 'Show more',
      errorIconAriaLabel: 'Error',
    }} />;
};
export const Default: Story = { render: () => <Controlled /> };
`);

// ─── Collections ─────────────────────────────────────────────────────────────
add('Table', `${HEADER(`import Box from '@risk-smart/themed-cloudscape-components/box';
import Button from '@risk-smart/themed-cloudscape-components/button';
import Header from '@risk-smart/themed-cloudscape-components/header';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Table from '@risk-smart/themed-cloudscape-components/table';
import { useState } from 'react';`)}
${META('Table', 'fullscreen')}
type Risk = { id: string; name: string; severity: string; owner: string; status: string };
const ITEMS: Risk[] = [
  { id: 'R-001', name: 'Data breach via S3', severity: 'Critical', owner: 'Sarah Chen', status: 'Open' },
  { id: 'R-002', name: 'Vendor SLA miss', severity: 'High', owner: 'Tom Patel', status: 'In review' },
  { id: 'R-003', name: 'Phishing susceptibility', severity: 'Medium', owner: 'Liam Nguyen', status: 'Open' },
  { id: 'R-004', name: 'Badge duplication', severity: 'Low', owner: 'Ava Rodriguez', status: 'Mitigated' },
];
const COLS = [
  { id: 'id', header: 'ID', cell: (i: Risk) => i.id, isRowHeader: true },
  { id: 'name', header: 'Name', cell: (i: Risk) => i.name },
  { id: 'severity', header: 'Severity', cell: (i: Risk) => i.severity },
  { id: 'owner', header: 'Owner', cell: (i: Risk) => i.owner },
  { id: 'status', header: 'Status', cell: (i: Risk) => i.status },
];
export const Default: Story = {
  render: () => <Table columnDefinitions={COLS} items={ITEMS} header={<Header counter={\`(\${ITEMS.length})\`}>Risks</Header>} />,
};
export const WithSelection: Story = {
  render: () => {
    const [sel, setSel] = useState<Risk[]>([]);
    return <Table columnDefinitions={COLS} items={ITEMS} selectedItems={sel}
      onSelectionChange={({ detail }) => setSel(detail.selectedItems)} selectionType={'multi'}
      header={<Header counter={sel.length ? \`(\${sel.length}/\${ITEMS.length})\` : \`(\${ITEMS.length})\`}
        actions={<SpaceBetween size={'xs'} direction={'horizontal'}>
          <Button disabled={!sel.length}>Archive</Button>
          <Button variant={'primary'}>Create</Button>
        </SpaceBetween>}>Risks</Header>} />;
  },
};
export const Empty: Story = {
  render: () => <Table columnDefinitions={COLS} items={[]} header={<Header>Risks</Header>}
    empty={<Box textAlign={'center'} color={'inherit'}><SpaceBetween size={'xs'}><b>No risks</b><Button>Create</Button></SpaceBetween></Box>} />,
};
export const Loading: Story = {
  render: () => <Table columnDefinitions={COLS} items={[]} loading loadingText={'Loading…'} header={<Header>Risks</Header>} />,
};
`);

add('Cards', `${HEADER(`import Box from '@risk-smart/themed-cloudscape-components/box';
import Button from '@risk-smart/themed-cloudscape-components/button';
import Cards from '@risk-smart/themed-cloudscape-components/cards';
import Header from '@risk-smart/themed-cloudscape-components/header';
import Link from '@risk-smart/themed-cloudscape-components/link';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';`)}
${META('Cards', 'fullscreen')}
type Risk = { id: string; name: string; severity: string; owner: string; description: string };
const ITEMS: Risk[] = [
  { id: 'R-001', name: 'Data breach via misconfigured S3', severity: 'Critical', owner: 'Sarah Chen', description: 'Public-read ACL on a customer-data bucket.' },
  { id: 'R-002', name: 'Vendor SLA non-compliance', severity: 'High', owner: 'Tom Patel', description: 'Two key vendors missed uptime SLAs.' },
  { id: 'R-003', name: 'Phishing susceptibility', severity: 'Medium', owner: 'Liam Nguyen', description: 'Sim shows ~14% click-through.' },
  { id: 'R-004', name: 'Office access card duplication', severity: 'Low', owner: 'Ava Rodriguez', description: 'Legacy badge tech.' },
];
const def = {
  header: (i: Risk) => <Link fontSize={'heading-m'} href={'#'}>{i.name}</Link>,
  sections: [
    { id: 'severity', header: 'Severity', content: (i: Risk) => i.severity },
    { id: 'owner', header: 'Owner', content: (i: Risk) => i.owner },
    { id: 'description', header: 'Description', content: (i: Risk) => i.description },
  ],
};
export const Default: Story = {
  render: () => <Cards cardDefinition={def} items={ITEMS} header={<Header counter={\`(\${ITEMS.length})\`}>Risks</Header>} cardsPerRow={[{ cards: 1 }, { minWidth: 500, cards: 2 }]} />,
};
export const Empty: Story = {
  render: () => <Cards cardDefinition={def} items={[]} header={<Header>Risks</Header>}
    empty={<Box textAlign={'center'} color={'inherit'}><SpaceBetween size={'xs'}><b>No risks</b><Button>Create</Button></SpaceBetween></Box>} />,
};
`);

add('SideNavigation', `${HEADER(`import SideNavigation, { type SideNavigationProps } from '@risk-smart/themed-cloudscape-components/side-navigation';
import { useState } from 'react';`)}
${META('SideNavigation', 'fullscreen')}
const ITEMS: SideNavigationProps.Item[] = [
  { type: 'link', text: 'Home', href: '#/' },
  { type: 'section', text: 'Risk', items: [
    { type: 'link', text: 'Risks', href: '#/risks' },
    { type: 'link', text: 'Heatmap', href: '#/heatmap' },
  ] },
  { type: 'section', text: 'Compliance', items: [
    { type: 'link', text: 'Frameworks', href: '#/frameworks' },
    { type: 'link', text: 'Controls', href: '#/controls' },
  ] },
  { type: 'divider' },
  { type: 'link', text: 'Settings', href: '#/settings' },
];
const Demo = () => {
  const [active, setActive] = useState('#/risks');
  return <div style={{ width: 280, borderRight: '1px solid #e9ebed', minHeight: 400 }}>
    <SideNavigation header={{ text: 'RiskSmart', href: '#/' }} items={ITEMS} activeHref={active}
      onFollow={(e) => { if (!e.detail.external) { e.preventDefault(); setActive(e.detail.href); } }} />
  </div>;
};
export const Default: Story = { render: () => <Demo /> };
`);

add('Wizard', `${HEADER(`import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Input from '@risk-smart/themed-cloudscape-components/input';
import Wizard from '@risk-smart/themed-cloudscape-components/wizard';
import { useState } from 'react';`)}
${META('Wizard', 'fullscreen')}
const Demo = () => {
  const [step, setStep] = useState(0);
  return <Wizard
    i18nStrings={{
      stepNumberLabel: (n) => \`Step \${n}\`,
      collapsedStepsLabel: (n, total) => \`Step \${n} of \${total}\`,
      cancelButton: 'Cancel',
      previousButton: 'Previous',
      nextButton: 'Next',
      submitButton: 'Submit',
    }}
    activeStepIndex={step}
    onNavigate={({ detail }) => setStep(detail.requestedStepIndex)}
    onSubmit={() => alert('Submit')}
    steps={[
      { title: 'Identify the risk', content: <FormField label={'Risk name'}><Input value={''} onChange={() => {}} /></FormField> },
      { title: 'Assess impact', content: <FormField label={'Impact'}><Input value={''} onChange={() => {}} /></FormField> },
      { title: 'Mitigate', content: <FormField label={'Mitigation'}><Input value={''} onChange={() => {}} /></FormField> },
      { title: 'Review', content: <p>Review and submit.</p> },
    ]} />;
};
export const Default: Story = { render: () => <Demo /> };
`);

// ─── Write everything ────────────────────────────────────────────────────────
mkdirSync(ROOT, { recursive: true });

// Shared setup file
writeFileSync(
  join(ROOT, '_setup.ts'),
  `import '@cloudscape-design/global-styles/index.css';\n`,
);

let written = 0;
for (const [name, source] of Object.entries(FILES)) {
  const dir = join(ROOT, name);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${name}.stories.tsx`);
  writeFileSync(file, source.trimStart());
  written += 1;
}

// Write SKIP report
writeFileSync(
  join(ROOT, 'SKIP.md'),
  `# Skipped Cloudscape components\n\n${Object.entries(SKIP)
    .map(([k, v]) => `- **${PASCAL(k)}** (\`${k}\`) — ${v}`)
    .join('\n')}\n`,
);

console.log(`Wrote ${written} story files + _setup.ts + SKIP.md`);
console.log(`Skipped ${Object.keys(SKIP).length} components (see SKIP.md)`);

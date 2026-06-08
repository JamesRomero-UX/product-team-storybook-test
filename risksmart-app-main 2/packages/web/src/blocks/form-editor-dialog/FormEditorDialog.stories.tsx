import { Button, cn } from '@risksmart-app/atomic-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  expect,
  fireEvent,
  fn,
  screen,
  userEvent,
  waitFor,
} from 'storybook/test';

import { FormEditorDialog } from './index';
import type { FormEditorInitialData, FormEditorOutput } from './types';

const SAMPLE_DATA: FormEditorInitialData = {
  sections: [
    {
      id: 'basic-info',
      name: 'Basic information',
      fieldIds: ['field-1', 'field-2', 'field-3'],
    },
    { id: 'security', name: 'Security', fieldIds: [] },
    { id: 'technology', name: 'Technology', fieldIds: [] },
  ],
  fields: {
    'field-1': { name: 'Risk name', type: 'text', required: true },
    'field-2': {
      name: 'Risk tier',
      type: 'radio',
      required: true,
      config: {
        fieldType: 'radio',
        fieldName: 'Risk tier',
        required: true,
        readOnly: false,
        options: [
          { id: 'tier-1', label: '1' },
          { id: 'tier-2', label: '2' },
          { id: 'tier-3', label: '3' },
        ],
        conditionalLogicEnabled: false,
        conditionalLogicRules: [],
        guidanceEnabled: false,
        guidance: '',
      },
    },
    'field-3': { name: 'Owner', type: 'text', required: false },
  },
};

const FormEditorWrapper = ({
  initialData,
  onSave,
  onOpenChange,
  getValueOptions,
}: {
  initialData?: FormEditorInitialData;
  onSave: (data: FormEditorOutput) => void;
  onOpenChange: (open: boolean) => void;
  getValueOptions?: (
    fieldValue: string
  ) => Array<{ value: string; label: string }>;
}) => {
  const [open, setOpen] = useState(true);

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    onOpenChange(o);
  };

  return (
    <div className={cn('flex flex-col gap-4 items-center')}>
      <Button onClick={() => setOpen(true)}>{'Open Form Editor'}</Button>
      <FormEditorDialog
        open={open}
        onOpenChange={handleOpenChange}
        initialData={initialData}
        getValueOptions={
          getValueOptions ??
          ((fieldValue) => {
            if (fieldValue === 'field-2') {
              return [
                { value: 'tier-1', label: 'Tier 1' },
                { value: 'tier-2', label: 'Tier 2' },
                { value: 'tier-3', label: 'Tier 3' },
              ];
            }

            return [];
          })
        }
        onSave={onSave}
      />
    </div>
  );
};

const meta = {
  title: 'Blocks/FormEditorDialog',
  component: FormEditorDialog,
  tags: ['!autodocs', 'wip'],
  args: {
    open: true,
    onOpenChange: fn(),
    initialData: undefined,
    getValueOptions: () => [],
    onSave: fn(),
    lang: undefined,
  },
} satisfies Meta<typeof FormEditorDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/* -------------------------------------------------------------------------- */
/*  Default — visual-only story (no interaction tests)                        */
/* -------------------------------------------------------------------------- */

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    const handleSave = (data: FormEditorOutput) => {
      alert('Check console for saved form config');
      console.log('Saved:', data);
      setOpen(false);
    };

    return (
      <div className={cn('flex flex-col gap-4 items-center')}>
        <Button onClick={() => setOpen(true)}>{'Open Form Editor'}</Button>
        <FormEditorDialog
          open={open}
          onOpenChange={setOpen}
          initialData={SAMPLE_DATA}
          getValueOptions={(fieldValue) => {
            if (fieldValue === 'field-2') {
              return [
                { value: 'tier-1', label: 'Tier 1' },
                { value: 'tier-2', label: 'Tier 2' },
                { value: 'tier-3', label: 'Tier 3' },
              ];
            }

            return [];
          }}
          onSave={handleSave}
        />
      </div>
    );
  },
};

/* -------------------------------------------------------------------------- */
/*  MainDialogFlow — render, add/edit/delete section, delete field, preview   */
/* -------------------------------------------------------------------------- */

export const MainDialogFlow: Story = {
  render: (args) => (
    <FormEditorWrapper
      initialData={SAMPLE_DATA}
      onSave={args.onSave}
      onOpenChange={args.onOpenChange}
      getValueOptions={args.getValueOptions}
    />
  ),
  play: async ({ args }) => {
    // -- Render checks --
    const title = await screen.findByText('Form editor');
    await expect(title).toBeVisible();

    // All 3 sections visible
    await expect(screen.getByText('Basic information')).toBeVisible();
    await expect(screen.getByText('Security')).toBeVisible();
    await expect(screen.getByText('Technology')).toBeVisible();

    // Fields visible in the open accordion
    await expect(screen.getByText('Risk name')).toBeVisible();
    await expect(screen.getByText('Risk tier')).toBeVisible();
    await expect(screen.getByText('Owner')).toBeVisible();

    // Required badges
    const requiredBadges = screen.getAllByText('Required');
    await expect(requiredBadges.length).toBeGreaterThanOrEqual(2);

    // -- Add section --
    const addSectionBtn = screen.getByRole('button', { name: /add section/i });
    await userEvent.click(addSectionBtn);

    await waitFor(() =>
      expect(screen.getByText('Section editor')).toBeVisible()
    );

    const sectionNameInput = screen.getByPlaceholderText('Enter section name');
    await userEvent.type(sectionNameInput, 'New Section');

    const addSectionSave = screen.getByRole('button', {
      name: /add section/i,
    });
    await userEvent.click(addSectionSave);

    await waitFor(() => expect(screen.getByText('New Section')).toBeVisible());

    // -- Edit section --
    const editButtons = screen.getAllByRole('button', {
      name: /edit section/i,
    });
    // Edit "Basic information" (first section)
    fireEvent.click(editButtons[0]);

    await waitFor(() =>
      expect(screen.getByText('Section editor')).toBeVisible()
    );

    const editNameInput = screen.getByPlaceholderText('Enter section name');
    await expect(editNameInput).toHaveValue('Basic information');

    await userEvent.clear(editNameInput);
    await userEvent.type(editNameInput, 'Updated Section');

    const editSaveBtn = screen.getByRole('button', { name: /edit section/i });
    await userEvent.click(editSaveBtn);

    await waitFor(() =>
      expect(screen.getByText('Updated Section')).toBeVisible()
    );

    // -- Delete section (Security) --
    // Find the Security section's accordion trigger, then scope to its header
    const securityTrigger = screen
      .getByText('Security')
      .closest('[data-slot="accordion-header"]') as HTMLElement;
    const secDeleteContainer = securityTrigger.querySelector(
      '[data-slot="confirmable-delete-button"]'
    ) as HTMLElement;
    const secTrashBtn = secDeleteContainer.querySelector(
      'button[aria-label="Delete"]'
    ) as HTMLElement;
    fireEvent.click(secTrashBtn);

    // Wait for confirming state — "Cancel delete" button appears
    await waitFor(() =>
      expect(
        secDeleteContainer.querySelector('button[aria-label="Cancel delete"]')
      ).toBeTruthy()
    );
    // Click the sliding-in "Delete" confirm button
    const secConfirmBtn = secDeleteContainer.querySelector(
      'button[class*="destructive"]'
    ) as HTMLElement;
    fireEvent.click(secConfirmBtn);

    // Security section should be removed
    await waitFor(() => {
      const remaining = document.querySelectorAll(
        '[data-slot="accordion-trigger"]'
      );
      const securityStillExists = Array.from(remaining).some((el) =>
        el.textContent?.includes('Security')
      );
      expect(securityStillExists).toBe(false);
    });

    // -- Delete field (Owner) --
    // Find the Owner field card, then scope to its delete button
    const ownerCard = screen
      .getByText('Owner')
      .closest('.group\\/field-card') as HTMLElement;
    const fieldDeleteContainer = ownerCard.querySelector(
      '[data-slot="confirmable-delete-button"]'
    ) as HTMLElement;
    const fieldTrashBtn = fieldDeleteContainer.querySelector(
      'button[aria-label="Delete"]'
    ) as HTMLElement;
    fireEvent.click(fieldTrashBtn);

    // Wait for confirming state
    await waitFor(() =>
      expect(
        fieldDeleteContainer.querySelector('button[aria-label="Cancel delete"]')
      ).toBeTruthy()
    );
    // Click the confirm button
    const fieldConfirmBtn = fieldDeleteContainer.querySelector(
      'button[class*="destructive"]'
    ) as HTMLElement;
    fireEvent.click(fieldConfirmBtn);

    // Owner should be removed
    await waitFor(() =>
      expect(screen.queryByText('Owner')).not.toBeInTheDocument()
    );

    // -- Preview mode --
    const previewBtn = screen.getByRole('button', { name: /preview/i });
    await userEvent.click(previewBtn);

    await waitFor(() =>
      expect(screen.getByText('Preview mode active')).toBeVisible()
    );
    await expect(
      screen.getByText('Test your form with conditional logic')
    ).toBeVisible();
    await expect(screen.getByText('Updated Section')).toBeVisible();

    // Toggle preview off
    await userEvent.click(previewBtn);

    await waitFor(() =>
      expect(
        screen.getByText('Drag and drop to reorder sections and fields')
      ).toBeVisible()
    );

    // -- Save and verify output --
    const saveBtn = screen.getByRole('button', { name: 'Save' });
    await userEvent.click(saveBtn);

    await waitFor(() => expect(args.onSave).toHaveBeenCalledTimes(1));

    const savedData = (args.onSave as ReturnType<typeof fn>).mock
      .calls[0][0] as FormEditorOutput;
    // 3 original - 1 deleted (Security) + 1 added (New Section) = 3
    await expect(savedData.sections.length).toBe(3);
    await expect(savedData.sections[0].name).toBe('Updated Section');
    await expect(
      savedData.sections.find((s) => s.name === 'Security')
    ).toBeUndefined();
    await expect(savedData.sections[2].name).toBe('New Section');
    // Owner was deleted — Updated Section should have 2 fields
    await expect(savedData.sections[0].fieldIds.length).toBe(2);
  },
};

/* -------------------------------------------------------------------------- */
/*  FieldEditorFlow — add field, validation, exclusive switches               */
/* -------------------------------------------------------------------------- */

export const FieldEditorFlow: Story = {
  render: (args) => (
    <FormEditorWrapper
      initialData={SAMPLE_DATA}
      onSave={args.onSave}
      onOpenChange={args.onOpenChange}
    />
  ),
  play: async ({ args }) => {
    await screen.findByText('Form editor');

    // -- Validation: submit empty field editor --
    const addFieldsButtons = screen.getAllByRole('button', {
      name: /add fields/i,
    });
    await userEvent.click(addFieldsButtons[0]);

    await waitFor(() => expect(screen.getByText('Field editor')).toBeVisible());

    // Clear the default field name to trigger validation
    const fieldNameInput = screen.getByPlaceholderText('Risk name');
    await userEvent.clear(fieldNameInput);

    const addFieldBtn = screen.getByRole('button', { name: /add field/i });
    await userEvent.click(addFieldBtn);

    await waitFor(() =>
      expect(screen.getByText('Field name is required')).toBeVisible()
    );

    // -- Exclusive switches: Required/Read only mutual exclusion --
    // Base UI Switch renders <span role="switch"> which doesn't pick up the
    // wrapping <label> text as an accessible name. Find via label text instead.
    // Use getAllByText because "Required" also appears as badge text on field cards.
    const requiredLabel = screen
      .getAllByText('Required')
      .find((el) => el.closest('label'))!
      .closest('label')!;
    const readOnlyLabel = screen.getByText('Read only').closest('label')!;
    const requiredSwitch = requiredLabel.querySelector(
      '[role="switch"]'
    ) as HTMLElement;
    const readOnlySwitch = readOnlyLabel.querySelector(
      '[role="switch"]'
    ) as HTMLElement;

    await expect(requiredSwitch).toHaveAttribute('aria-checked', 'false');
    await expect(readOnlySwitch).toHaveAttribute('aria-checked', 'false');

    // Toggle Required on
    await userEvent.click(requiredSwitch);
    await waitFor(() =>
      expect(requiredSwitch).toHaveAttribute('aria-checked', 'true')
    );
    await expect(readOnlySwitch).toHaveAttribute('aria-checked', 'false');

    // Toggle Read only on -> Required should turn off
    await userEvent.click(readOnlySwitch);
    await waitFor(() =>
      expect(readOnlySwitch).toHaveAttribute('aria-checked', 'true')
    );
    await expect(requiredSwitch).toHaveAttribute('aria-checked', 'false');

    // Toggle Required on again -> Read only should turn off
    await userEvent.click(requiredSwitch);
    await waitFor(() =>
      expect(requiredSwitch).toHaveAttribute('aria-checked', 'true')
    );
    await expect(readOnlySwitch).toHaveAttribute('aria-checked', 'false');

    // -- Add field successfully --
    await userEvent.type(fieldNameInput, 'New Custom Field');
    await userEvent.click(addFieldBtn);

    // Returns to main dialog with new field visible
    await waitFor(() =>
      expect(screen.getByText('New Custom Field')).toBeVisible()
    );

    // Save and verify new field in output
    const saveBtn = screen.getByRole('button', { name: 'Save' });
    await userEvent.click(saveBtn);

    await waitFor(() => expect(args.onSave).toHaveBeenCalledTimes(1));
    const savedData = (args.onSave as ReturnType<typeof fn>).mock
      .calls[0][0] as FormEditorOutput;
    // Basic information section should now have 4 fields
    await expect(savedData.sections[0].fieldIds.length).toBe(4);
  },
};

/* -------------------------------------------------------------------------- */
/*  SectionEditorFlow — validation, conditional logic                         */
/* -------------------------------------------------------------------------- */

export const SectionEditorFlow: Story = {
  render: (args) => (
    <FormEditorWrapper
      initialData={SAMPLE_DATA}
      onSave={args.onSave}
      onOpenChange={args.onOpenChange}
    />
  ),
  play: async () => {
    await screen.findByText('Form editor');

    // -- Validation: submit empty section name --
    const addSectionBtn = screen.getByRole('button', {
      name: /add section/i,
    });
    await userEvent.click(addSectionBtn);

    await waitFor(() =>
      expect(screen.getByText('Section editor')).toBeVisible()
    );

    const saveBtn = screen.getByRole('button', { name: /add section/i });
    await userEvent.click(saveBtn);

    await waitFor(() =>
      expect(screen.getByText('Name is required')).toBeVisible()
    );

    // Cancel and go back to main dialog
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelBtn);

    await waitFor(() => expect(screen.getByText('Form editor')).toBeVisible());

    // -- Conditional logic: edit existing section --
    const editButtons = screen.getAllByRole('button', {
      name: /edit section/i,
    });
    fireEvent.click(editButtons[0]);

    await waitFor(() =>
      expect(screen.getByText('Section editor')).toBeVisible()
    );

    // Toggle Conditional logic switch — find via heading text, then get the
    // switch within the same accordion header (Base UI switch has no accessible name)
    const condLogicHeader = screen
      .getByText('Conditional logic')
      .closest('[data-slot="accordion-header"]') as HTMLElement;
    const condLogicSwitch = condLogicHeader.querySelector(
      '[role="switch"]'
    ) as HTMLElement;
    await userEvent.click(condLogicSwitch);

    // Rule builder should appear with "Add rule" button
    await waitFor(() => expect(screen.getByText('Add rule')).toBeVisible());

    // Add a rule
    const addRuleBtn = screen.getByRole('button', { name: /add rule/i });
    await userEvent.click(addRuleBtn);

    // Rule 1 card should appear
    await waitFor(() => expect(screen.getByText('Rule 1')).toBeVisible());

    // Delete the rule by clicking the trash icon inside the rule card
    const ruleCard = screen.getByText('Rule 1').closest('div');
    const deleteRuleBtn = ruleCard?.querySelector(
      'button[aria-label], button:has(svg)'
    );
    if (deleteRuleBtn) {
      fireEvent.click(deleteRuleBtn);
    }

    // Rule 1 should be gone
    await waitFor(() =>
      expect(screen.queryByText('Rule 1')).not.toBeInTheDocument()
    );
  },
};

/* -------------------------------------------------------------------------- */
/*  Empty — empty state with no initial data                                  */
/* -------------------------------------------------------------------------- */

export const Empty: Story = {
  render: (args) => (
    <FormEditorWrapper onSave={args.onSave} onOpenChange={args.onOpenChange} />
  ),
  play: async ({ args }) => {
    // Dialog renders
    await screen.findByText('Form editor');

    // No sections visible, but "Add section" button is there
    const addSectionBtn = screen.getByRole('button', {
      name: /add section/i,
    });
    await expect(addSectionBtn).toBeVisible();

    // No section text visible
    expect(screen.queryByText('Basic information')).not.toBeInTheDocument();

    // Save with empty form
    const saveBtn = screen.getByRole('button', { name: 'Save' });
    await userEvent.click(saveBtn);

    await waitFor(() => expect(args.onSave).toHaveBeenCalledTimes(1));
    const savedData = (args.onSave as ReturnType<typeof fn>).mock
      .calls[0][0] as FormEditorOutput;
    await expect(savedData.sections).toEqual([]);
    await expect(savedData.fields).toEqual({});
  },
};

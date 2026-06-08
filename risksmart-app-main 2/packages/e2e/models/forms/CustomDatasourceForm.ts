import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';
import _ from 'lodash';

import { FieldSelectionModal } from '../modals/FieldSelectionModal';
import { BaseForm } from './BaseForm';
import { Checkbox } from './fields/Checkbox';
import { Select } from './fields/Select';

type DataSource = {
  type: string;
  fields?: { defaultLabel: string; customLabel?: string }[];
  children?: DataSource[];
  latestOnly?: boolean;
  leftJoin?: boolean;
};

export type CustomDatasourceFormValues = {
  title: string;
  dataSource: DataSource;
};

const getDatasourceTreeTestId = (index: number[] = []) =>
  `dataSource${index.length > 0 ? '-' : ''}${index.join('-')}`;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export class CustomDatasourceForm extends BaseForm<{}> {
  readonly title: Locator;
  readonly previewButton: Locator;
  readonly fieldSelectionModal: FieldSelectionModal;

  constructor(page: Page) {
    super(page);
    this.fieldSelectionModal = new FieldSelectionModal(page);
    this.title = page.getByLabel('Title', { exact: true });
    this.previewButton = this.page.getByRole('button', {
      name: 'Preview',
      exact: true,
    });
  }

  getDatasourceSelect(index: number[] = []) {
    return new Select(this.page, `${getDatasourceTreeTestId(index)}`);
  }

  getSelectFieldsButton(index: number[] = []) {
    return this.page.getByTestId(
      `${getDatasourceTreeTestId(index)}-edit-columns`
    );
  }
  getDatasourceAddButton(index: number[] = []) {
    return this.page.getByTestId(`${getDatasourceTreeTestId(index)}-add`);
  }

  getLatestOnlyCheckbox(index: number[] = []) {
    return new Checkbox(
      this.page,
      `${getDatasourceTreeTestId(index)}-latestOnly`
    );
  }
  getLeftJoinCheckbox(index: number[] = []) {
    return new Checkbox(
      this.page,
      `${getDatasourceTreeTestId(index)}-leftJoin`
    );
  }

  async setDatasource(index: number[], dataSource: DataSource) {
    if (index.length > 0) {
      await this.getDatasourceAddButton(index.slice(0, -1)).click();
    }
    await this.getDatasourceSelect(index).setValue(dataSource.type);

    if (!_.isNil(dataSource.leftJoin)) {
      await this.getLeftJoinCheckbox(index).setValue(!!dataSource.leftJoin);
    }

    if (!_.isNil(dataSource.latestOnly)) {
      await this.getLatestOnlyCheckbox(index).setValue(!!dataSource.latestOnly);
    }
    if (dataSource.fields) {
      await this.getSelectFieldsButton(index).click();
      await this.fieldSelectionModal.fieldSelectionForm.fillFormAndClickSave({
        selectedFields: dataSource.fields,
      });
    }
    for (const [i, child] of (dataSource.children ?? []).entries()) {
      await this.setDatasource([...index, i], child);
    }
  }

  async fillForm({ title, dataSource }: Partial<CustomDatasourceFormValues>) {
    if (title) {
      await this.title.fill(title);
    }
    if (dataSource) {
      await this.setDatasource([], dataSource);
    }
  }
}

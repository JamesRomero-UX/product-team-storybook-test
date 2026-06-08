import type { DB } from 'generated-db/db';

import type { TableNames } from '../datasets/types';

export interface CustomAttributeWithJoinQueryInfo<Table extends TableNames> {
  /**
   * Custom attributes are stored as text in the database, however they can represent uuids in the case of departments, tags etc.
   * This field is used to correctly cast the value to support joins
   */
  pgIdColumnDataType: 'text' | 'uuid' | 'jsonb';
  /*
    Custom attribute ID column. Used for joining to pgTable
  */
  pgIdColumn: keyof DB[Table];
  /*
    Custom attribute label column
  */
  pgLabelColumn: keyof DB[Table];
  /**
   * Table where custom attribute label is stored
   */
  pgTable: Table;

  /**
   * Is the custom attribute a multiselect?
   */
  isArray?: boolean;
}

export interface CustomAttributeWithJoin {
  /**
   * Custom attributes are stored as text in the database, however they can represent uuids in the case of departments, tags etc.
   * This field is used to correctly cast the value to support joins
   */
  pgIdColumnDataType: 'text' | 'uuid' | 'jsonb';
  /*
   * Custom attribute ID column. Used for joining to pgTable
   */
  pgIdColumn: string;
  /*
   * Custom attribute label column
   */
  pgLabelColumn: string;
  /**
   * Table where custom attribute label is stored
   */
  pgTable: string;

  /**
   * Is the custom attribute a multiselect?
   */
  isArray?: boolean;
}

export type CustomAttributeWithJoinQueryInfoBasic =
  | {
      /**
       * Custom attributes are stored as text in the database, however they can represent uuids in the case of departments, tags etc.
       * This field is used to correctly cast the value to support joins
       */
      pgIdColumnDataType: 'text' | 'uuid' | 'jsonb';

      /**
       * Is the custom attribute a multiselect?
       */
      isArray?: boolean;
    }
  | CustomAttributeWithJoin;

import type { CustomAttributeWithJoinQueryInfo } from './types';

export const userMultiselect: CustomAttributeWithJoinQueryInfo<'risksmart.user_view_active'> =
  {
    pgIdColumn: 'Id',
    pgIdColumnDataType: 'text',
    pgLabelColumn: 'FriendlyName',
    pgTable: 'risksmart.user_view_active',
    isArray: true,
  };

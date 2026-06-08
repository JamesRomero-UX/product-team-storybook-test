import { useLazyQuery } from '@apollo/client';
import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetFormConfigurationByParentTypeDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentText } from 'pdfmake/interfaces';

import type { JSONObject } from '@/types/types';

import { getCustomAttributeDataForExport } from './getCustomAttributeDataForExport';

const useCustomAttributeDataForExport = <
  T extends {
    CustomAttributeData?: JSONObject | null;
  },
>(
  parentType: Parent_Type_Enum
): [(item: T) => Promise<(ContentText | string)[]>, boolean] => {
  const [getSchema, getSchemasResult] = useLazyQuery(
    GetFormConfigurationByParentTypeDocument,
    {
      variables: {
        parentTypes: [parentType],
      },
    }
  );

  return [
    async (item: T) => {
      const { data: schemaData } = await getSchema();

      return getCustomAttributeDataForExport(
        item,
        schemaData?.form_configuration?.[0]?.customAttributeSchema
      );
    },
    getSchemasResult.loading,
  ];
};
export default useCustomAttributeDataForExport;

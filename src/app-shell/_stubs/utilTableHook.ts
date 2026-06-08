// Catch-all for @/utils/table/hooks/* — production hooks that build column
// definitions, filter properties, etc. Storybook stories don't need real data
// here; the table renders empty until the story supplies its own props.
const noopResult: any = {
  columns: [],
  filterProperties: [],
  filterOptions: [],
  customAttributes: [],
};

const fn = () => noopResult;

export default fn;
export const useAddCustomAttributes = () => ({ columns: [], extraColumns: [] });
export const useCreateFilterOptions = () => [];
export const useCreateFilterProperties = () => [];
export const useBuildTableProps = () => ({});
export const useGetDefaultTablePreferences = () => ({});
export const usePreprocessTableData = () => ({ data: [] });
export const useCreateColumnDefinitions = () => [];

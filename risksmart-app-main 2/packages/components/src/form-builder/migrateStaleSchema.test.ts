import { migrateStaleSchema } from './migrateStaleSchema';
import { useFormBuilderFieldStore } from './store/useFormBuilderFieldStore';
import { useFormBuilderStore } from './store/useFormBuilderStore';
import {
  migratedStaleSchema,
  nonStaleSchema,
  nonStaleUISchema,
  staleSchema0,
  staleSchema1,
  staleSchema2,
  staleUISchema,
  staleUISchema2,
} from './testFixtures';
import type { CustomSchema } from './types';
import { resetStores } from './utils.test';

describe('migrateStaleSchema', () => {
  const getSchema = () => useFormBuilderStore.getState().schema;
  const getUISchema = () => useFormBuilderStore.getState().uiSchema;

  beforeEach(() => {
    resetStores();
  });

  it('should successfully migrate a stale multiselect schema with only a oneOf array into latest format', () => {
    useFormBuilderStore.setState({
      schema: staleSchema0,
      uiSchema: staleUISchema,
    });

    migrateStaleSchema(staleSchema0, staleUISchema);

    expect(getUISchema()).toEqual(staleUISchema);
    expect(getSchema()).toEqual(migratedStaleSchema);
  });

  it('should successfully migrate a stale multiselect schema with both a oneOf and items property into latest format', () => {
    useFormBuilderStore.setState({
      schema: staleSchema1,
      uiSchema: staleUISchema,
    });

    migrateStaleSchema(staleSchema1, staleUISchema);

    expect(getUISchema()).toEqual(staleUISchema);
    expect(getSchema()).toEqual(migratedStaleSchema);
  });

  it('should not migrate a multiselect schema that is already in the latest format', () => {
    const updateFieldSpy = vi.spyOn(
      useFormBuilderFieldStore.getState(),
      'updateField'
    );

    useFormBuilderStore.setState({
      schema: nonStaleSchema,
      uiSchema: nonStaleUISchema,
    });

    migrateStaleSchema(nonStaleSchema, nonStaleUISchema);

    expect(getUISchema()).toEqual(nonStaleUISchema);
    expect(getSchema()).toEqual(nonStaleSchema);

    expect(updateFieldSpy).not.toHaveBeenCalled();
  });

  it('should migrate conditionalOptions tokens using option titles to generated IDs (oneOf)', () => {
    useFormBuilderStore.setState({
      schema: staleSchema2,
      uiSchema: staleUISchema2,
    });

    migrateStaleSchema(staleSchema2, staleUISchema2);

    const migratedTokens =
      getSchema()?.properties?.field2?.conditionalOptions?.tokens[0].value;
    expect(migratedTokens).toEqual(['opt1', 'opt2']);
  });

  it('should not migrate tokens if all values are already generated IDs', () => {
    const updateFieldSpy = vi.spyOn(
      useFormBuilderFieldStore.getState(),
      'updateField'
    );

    const nonStaleSchema2: CustomSchema = {
      ...staleSchema2,
      properties: {
        field1: {
          ...staleSchema2.properties!.field1,
          oneOf: [
            { const: 'id1', title: 'Option 1' },
            { const: 'id2', title: 'Option 2' },
          ],
        },
        field2: {
          ...staleSchema2.properties!.field2,
          conditionalOptions: {
            operation: 'and',
            tokens: [
              {
                propertyKey: 'field1',
                value: ['id1', 'id2'],
                operator: '=',
              },
            ],
          },
        },
      },
    };

    useFormBuilderStore.setState({
      schema: nonStaleSchema2,
      uiSchema: staleUISchema2,
    });

    migrateStaleSchema(nonStaleSchema2, staleUISchema2);

    expect(getUISchema()).toEqual(staleUISchema2);
    expect(getSchema()).toEqual(nonStaleSchema2);

    expect(updateFieldSpy).not.toHaveBeenCalled();
  });
});

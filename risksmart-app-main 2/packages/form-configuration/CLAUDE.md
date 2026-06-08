# packages/form-configuration

Dynamic form field configuration system for custom attributes.

## Key Patterns

- **Field type registry**: `fieldTypesConfig` maps `CustomAttributeFieldType` enum to implementations (text, select, multiselect, date, textarea, link, departmentMultiselect, userMultiselect). Add new field types here.
- Uses `@jsonforms/core` for JSON schema and UI schema generation.
- **Conditions system**: Fields can have conditional visibility based on other field values.
- Uses `sanitize-html` for XSS prevention on rich text fields.
- **Tagged types**: Discriminated unions for `FormFieldOption` (StringOption vs AltValueOption).

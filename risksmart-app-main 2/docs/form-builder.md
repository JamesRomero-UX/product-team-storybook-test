# Form Builder

## Overview

The form builder is a collection of components that allow users to create their own forms (e.g. questionnaires for third parties to fill out).
The form builder and its components are built using JSON Forms.

## Resources:

- [FormBuilder Component](../packages/components/FormBuilder/FormBuilder.tsx)
- [Examples](../packages/components/FormBuilder/examples/formBuilderSchemas.ts)
- JSON Forms - [Docs 🔗](https://jsonforms.io/docs)

## Basics

- JSON Forms use 2 configuration objects to render forms:
  - `schema` - Describes the structure of the form
  - `uischema` - Describes how the form should be rendered
  - Kind of like HTML and CSS for forms, where the `schema` is the HTML and the `uischema` is the CSS
  - See below for an example of a simple form `schema` and `uischema`
  - Naming: in some instances we refer to the uiSchema as:
    - `uischema`: the JSON Forms term
    - `fullUISchema`: the full UI Schema object
    - `currentElementUISchema`: a child element of the full UI Schema object
- Fields vs. Sections:
  - **Fields** are the form fields that users fill out in the form. These are known as `Controls` in JSON Forms
  - **Sections** are groups of fields. These are known as `Groups` in JSON Forms
  - **IMPORTANT:**
    - Sections represent logical groupings of fields in the form
    - They are purely a visual component and do not affect the underlying form `schema`
    - Any actions that affect sections will therefore only modify the UI Schema
- Required vs. Optional:
  - We currently use both methods of marking fields as required or optional:
    - `required` - Fields marked as required in the `schema` are added to the `required` array
    - `minLength` - Fields in the `schema` have a `minLength === 0` if they are optional or `minLength > 0` if they are required
  - **Why?** We need to account for 2 different scenarios when a user fills out a form.
    - If they touch a required form field and then leave it empty `onBlur` then ordinary validation kicks in (with `minLength` property).
    - But what if they don't touch the field at all? We need to know if the field is required so we can show a warning message to the user when form validation is triggered (as `minLength > 0` won't be triggered in this instance).

## Advanced

- JSON Forms & Dispatching - [DOCS 🔗](https://jsonforms.io/docs/tutorial/custom-renderers#dispatching)
- [Custom Renderers & Testers](../packages/components/FormBuilder/renderers)
  - JSON Forms allows you to create your own custom renderers
  - These renderers are registered and rendered whenever the JSON Forms engine a matching 'Schema Tester'
  - Schema Testers are functions that determine if a custom renderer should be used for a given `schema`
  - Testers can be found [here](../packages/components/FormBuilder/renderers/registry.ts) and are registered in the [rendererRegistry](../packages/components/FormBuilder/renderers/registry.ts)
  - To ensure custom renderers are used in a JSON Forms form you must pass the `rendererRegistry` to the JSON Forms component

<br></br>
_Renderer Registry Example:_

```tsx
  <JsonForms
      otherProps={...otherProps}
      renderers={rendererRegistry}
    />
```

- The [Form Builder Stores](../packages/components/FormBuilder/store) are used to keep track of the current form config being built and any other related state

## TODO: MVP

### Sections:

- ✅ Section create form
- ✅ Section edit form
- ✅ Remove section modal + logic
- ✅ Create Section form validation
- ✅ Section renderer

### Fields:

- ✅ Question create form
- ✅ Question edit form
- ✅ Remove field modal
- ✅ Create Question form validation
- ✅ Question renderer - text
- ✅ Question renderer - number
- ✅ Question renderer - url
- ✅ Question renderer - date
- ✅ Question renderer - dropdown
- ✅ Question renderer - radio
- 🔶 Question renderer - checkbox

### Form:

- ✅ Find a permanent home for all the form `schema` configs
- ✅ Handle required fields in form `schema`
- ✅ Save form config to database

### Misc:

- ✅ Fix translations
- ✅ Fix duplicate custom fields bug in form builder page

## TODO: V2

- ✅ New versions should clone most recent form config
- 🔶 Nested sections support (recursive search for add/delete)
- 🔶 Allow users to merge fields in a deleted section into another section
- ✅ Allow users to move fields around (add dragging support)

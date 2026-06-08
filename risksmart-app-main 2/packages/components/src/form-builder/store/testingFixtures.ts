import type { CustomSchema, CustomUISchema } from '../types';

export const schemaFixture: CustomSchema = {
  type: 'object',
  required: [
    'field_c40a977a-554a-4f81-8052-902e9157a357',
    'field_98e9a20f-efeb-4406-b8c4-39e490653989',
    'field_19394bc2-7f9f-40ff-a8d7-18b9ac245a2e',
  ],
  properties: {
    'field_1932f62a-a401-47dc-bbfc-de3b00feeff4': {
      type: 'string',
      parentId: 'section_6680fa39-f1e5-4fd0-94c9-78c3e89becea',
      minLength: 0,
      isCustomisable: true,
    },
    'field_19394bc2-7f9f-40ff-a8d7-18b9ac245a2e': {
      type: 'string',
      parentId: 'section_110a6373-1773-43f6-b251-970c9dd15a8f',
      minLength: 1,
      isCustomisable: true,
      allowAttachments: false,
    },
    'field_35ba9f3b-2e95-4142-98b8-25eeb40d7792': {
      type: 'string',
      parentId: 'section_e51c6ecb-265b-4345-bf31-578037d4fd2a',
      minLength: 0,
      isCustomisable: true,
    },
    'field_3ee1e383-fbb3-44d3-9217-911ed9e8e49b': {
      type: 'string',
      parentId: 'section_e2386aba-bd28-41de-8253-08cbb39e58d8',
      minLength: 0,
      isCustomisable: true,
    },
    'field_4769c978-0dbc-4765-b317-d33d286ef38e': {
      type: 'string',
      parentId: 'section_6680fa39-f1e5-4fd0-94c9-78c3e89becea',
      minLength: 0,
      isCustomisable: true,
    },
    'field_516ebb50-b212-4d4f-bc92-567e902a63d3': {
      type: 'array',
      items: {
        oneOf: [
          {
            const: 'b9f6a797-e385-402b-81e6-c0b981b1a669',
            title: 'A',
          },
          {
            const: 'f2dfa682-a749-465a-bca7-c32418587cfc',
            title: 'B',
          },
          {
            const: '18383355-9518-4d65-b0c5-21a7e243606f',
            title: 'C',
          },
        ],
      },
      parentId: 'section_6680fa39-f1e5-4fd0-94c9-78c3e89becea',
      minItems: 0,
      uniqueItems: true,
      isCustomisable: true,
      allowAttachments: false,
    },
    'field_5b829e19-28f4-4abf-912a-76f698f49db4': {
      type: 'string',
      oneOf: [
        {
          const: 'dd81d907-4669-435a-b220-c1210964d12a',
          title: 'A',
        },
        {
          const: '7e050eb0-7bc0-408a-881f-458752c67800',
          title: 'B',
        },
        {
          const: '6ef929ee-6fa8-4b8b-a918-f96803c3563b',
          title: 'C',
        },
      ],
      parentId: 'section_6680fa39-f1e5-4fd0-94c9-78c3e89becea',
      minLength: 0,
      isCustomisable: true,
      allowAttachments: false,
    },
    'field_70495795-f390-4799-9428-96afce5bee56': {
      type: 'string',
      parentId: 'section_6680fa39-f1e5-4fd0-94c9-78c3e89becea',
      minLength: 0,
      isCustomisable: true,
    },
    'field_98e9a20f-efeb-4406-b8c4-39e490653989': {
      type: 'string',
      parentId: 'section_110a6373-1773-43f6-b251-970c9dd15a8f',
      minLength: 1,
      isCustomisable: true,
      allowAttachments: false,
    },
    'field_b39eab5f-ee38-4d92-ac46-9baac4581a50': {
      type: 'string',
      parentId: 'section_110a6373-1773-43f6-b251-970c9dd15a8f',
      minLength: 0,
      isCustomisable: true,
      allowAttachments: false,
    },
    'field_c40a977a-554a-4f81-8052-902e9157a357': {
      type: 'string',
      parentId: 'section_e2386aba-bd28-41de-8253-08cbb39e58d8',
      minLength: 1,
      isCustomisable: true,
      allowAttachments: false,
    },
    'field_c8ec0b95-a45e-4bf6-aeac-3c610e2af289': {
      type: 'string',
      parentId: 'section_6680fa39-f1e5-4fd0-94c9-78c3e89becea',
      minLength: 0,
      isCustomisable: true,
    },
    'field_d2970b9a-ec71-470d-b01c-afb1dd920c7d': {
      type: 'string',
      parentId: 'section_e51c6ecb-265b-4345-bf31-578037d4fd2a',
      minLength: 0,
      isCustomisable: true,
      allowAttachments: false,
    },
    'field_d46230b1-0748-4bee-b3e6-0171743469be': {
      type: 'string',
      parentId: 'section_e51c6ecb-265b-4345-bf31-578037d4fd2a',
      minLength: 0,
      isCustomisable: true,
    },
    'field_e17091a6-aade-40dd-852b-0df99be796f0': {
      type: 'string',
      parentId: 'section_6680fa39-f1e5-4fd0-94c9-78c3e89becea',
      minLength: 0,
      isCustomisable: true,
      allowAttachments: false,
    },
  },
};

export const uiSchemaFixture: CustomUISchema = {
  type: 'VerticalLayout',
  elements: [
    {
      id: 'section_e2386aba-bd28-41de-8253-08cbb39e58d8',
      type: 'Group',
      label: 'Section 1 - Required vs. Optional',
      elements: [
        {
          id: 'field_c40a977a-554a-4f81-8052-902e9157a357',
          type: 'Control',
          label: 'This is a REQUIRED field',
          scope: '#/properties/field_c40a977a-554a-4f81-8052-902e9157a357',
          options: {
            placeholder: '',
            fieldType: 'text',
          },
          parentId: 'section_e2386aba-bd28-41de-8253-08cbb39e58d8',
        },
        {
          id: 'field_3ee1e383-fbb3-44d3-9217-911ed9e8e49b',
          type: 'Control',
          label: 'This is an OPTIONAL field',
          scope: '#/properties/field_3ee1e383-fbb3-44d3-9217-911ed9e8e49b',
          options: {
            fieldType: 'text',
            placeholder: '',
          },
          parentId: 'section_e2386aba-bd28-41de-8253-08cbb39e58d8',
        },
      ],
    },
    {
      id: 'section_6680fa39-f1e5-4fd0-94c9-78c3e89becea',
      type: 'Group',
      label: 'Section 2 - Field Types',
      elements: [
        {
          id: 'field_4769c978-0dbc-4765-b317-d33d286ef38e',
          type: 'Control',
          label: 'This is a TEXT field',
          scope: '#/properties/field_4769c978-0dbc-4765-b317-d33d286ef38e',
          options: {
            fieldType: 'text',
            placeholder: '',
          },
          parentId: 'section_6680fa39-f1e5-4fd0-94c9-78c3e89becea',
        },
        {
          id: 'field_c8ec0b95-a45e-4bf6-aeac-3c610e2af289',
          type: 'Control',
          label: 'This is a TEXT AREA field',
          scope: '#/properties/field_c8ec0b95-a45e-4bf6-aeac-3c610e2af289',
          options: {
            fieldType: 'textArea',
            placeholder: '',
          },
          parentId: 'section_6680fa39-f1e5-4fd0-94c9-78c3e89becea',
        },
        {
          id: 'field_1932f62a-a401-47dc-bbfc-de3b00feeff4',
          type: 'Control',
          label: 'This is a NUMBER field',
          scope: '#/properties/field_1932f62a-a401-47dc-bbfc-de3b00feeff4',
          options: {
            fieldType: 'number',
            placeholder: '',
          },
          parentId: 'section_6680fa39-f1e5-4fd0-94c9-78c3e89becea',
        },
        {
          id: 'field_70495795-f390-4799-9428-96afce5bee56',
          type: 'Control',
          label: 'This is a LINK (URL) field',
          scope: '#/properties/field_70495795-f390-4799-9428-96afce5bee56',
          options: {
            fieldType: 'url',
            placeholder: '',
          },
          parentId: 'section_6680fa39-f1e5-4fd0-94c9-78c3e89becea',
        },
        {
          id: 'field_e17091a6-aade-40dd-852b-0df99be796f0',
          type: 'Control',
          label: 'This is a DATE field',
          scope: '#/properties/field_e17091a6-aade-40dd-852b-0df99be796f0',
          options: {
            fieldType: 'date',
            placeholder: '',
          },
          parentId: 'section_6680fa39-f1e5-4fd0-94c9-78c3e89becea',
        },
        {
          id: 'field_5b829e19-28f4-4abf-912a-76f698f49db4',
          type: 'Control',
          label: 'This is a DROPDOWN field',
          scope: '#/properties/field_5b829e19-28f4-4abf-912a-76f698f49db4',
          options: {
            fieldType: 'dropdown',
            placeholder: '',
          },
          parentId: 'section_6680fa39-f1e5-4fd0-94c9-78c3e89becea',
        },
        {
          id: 'field_516ebb50-b212-4d4f-bc92-567e902a63d3',
          type: 'Control',
          label: 'This is a MULTISELECT field',
          scope: '#/properties/field_516ebb50-b212-4d4f-bc92-567e902a63d3',
          options: {
            fieldType: 'multiselect',
            placeholder: '',
          },
          parentId: 'section_6680fa39-f1e5-4fd0-94c9-78c3e89becea',
        },
      ],
    },
    {
      id: 'section_e51c6ecb-265b-4345-bf31-578037d4fd2a',
      type: 'Group',
      label: 'Section 3 - Other Options',
      elements: [
        {
          id: 'field_35ba9f3b-2e95-4142-98b8-25eeb40d7792',
          type: 'Control',
          label: 'This is a field WITHOUT a custom PLACEHOLDER',
          scope: '#/properties/field_35ba9f3b-2e95-4142-98b8-25eeb40d7792',
          options: {
            fieldType: 'text',
            placeholder: '',
          },
          parentId: 'section_e51c6ecb-265b-4345-bf31-578037d4fd2a',
        },
        {
          id: 'field_d46230b1-0748-4bee-b3e6-0171743469be',
          type: 'Control',
          label: 'This is a field WITH a custom PLACEHOLDER',
          scope: '#/properties/field_d46230b1-0748-4bee-b3e6-0171743469be',
          options: {
            fieldType: 'text',
            placeholder: 'See my cool placeholder text?',
          },
          parentId: 'section_e51c6ecb-265b-4345-bf31-578037d4fd2a',
        },
        {
          id: 'field_d2970b9a-ec71-470d-b01c-afb1dd920c7d',
          type: 'Control',
          label: 'This is a field WITH GUIDANCE',
          scope: '#/properties/field_d2970b9a-ec71-470d-b01c-afb1dd920c7d',
          options: {
            fieldType: 'text',
            description: "Help me Obi-wan, you're my only hope!",
            placeholder: "Help me Obi-wan, you're my only hope!",
          },
          parentId: 'section_e51c6ecb-265b-4345-bf31-578037d4fd2a',
        },
      ],
    },
    {
      id: 'section_110a6373-1773-43f6-b251-970c9dd15a8f',
      type: 'Group',
      label: 'Section 4 - Testing',
      elements: [
        {
          id: 'field_98e9a20f-efeb-4406-b8c4-39e490653989',
          type: 'Control',
          label: 'Required Text Field',
          scope: '#/properties/field_98e9a20f-efeb-4406-b8c4-39e490653989',
          options: {
            placeholder: '',
            fieldType: 'text',
          },
          parentId: 'section_110a6373-1773-43f6-b251-970c9dd15a8f',
        },
        {
          id: 'field_b39eab5f-ee38-4d92-ac46-9baac4581a50',
          type: 'Control',
          label: 'Optional Text Field',
          scope: '#/properties/field_b39eab5f-ee38-4d92-ac46-9baac4581a50',
          options: {
            fieldType: 'text',
            placeholder: '',
          },
          parentId: 'section_110a6373-1773-43f6-b251-970c9dd15a8f',
        },
        {
          id: 'field_19394bc2-7f9f-40ff-a8d7-18b9ac245a2e',
          type: 'Control',
          label: 'Required Number Field',
          scope: '#/properties/field_19394bc2-7f9f-40ff-a8d7-18b9ac245a2e',
          options: {
            placeholder: '',
            fieldType: 'number',
          },
          parentId: 'section_110a6373-1773-43f6-b251-970c9dd15a8f',
        },
      ],
    },
  ],
};

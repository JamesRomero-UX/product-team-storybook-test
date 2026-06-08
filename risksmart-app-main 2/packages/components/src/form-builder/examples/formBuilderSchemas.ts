export const schema = {
  type: 'object',
  required: ['field_c40a977a-554a-4f81-8052-902e9157a357'],
  properties: {
    'field_1932f62a-a401-47dc-bbfc-de3b00feeff4': {
      type: 'string',
      parentId: 'section_6680fa39-f1e5-4fd0-94c9-78c3e89becea',
      minLength: 0,
      isCustomisable: true,
      allowAttachments: false,
    },
    'field_35ba9f3b-2e95-4142-98b8-25eeb40d7792': {
      type: 'string',
      parentId: 'section_e51c6ecb-265b-4345-bf31-578037d4fd2a',
      minLength: 0,
      isCustomisable: true,
      allowAttachments: false,
    },
    'field_3ee1e383-fbb3-44d3-9217-911ed9e8e49b': {
      type: 'string',
      parentId: 'section_e2386aba-bd28-41de-8253-08cbb39e58d8',
      minLength: 0,
      isCustomisable: true,
      allowAttachments: false,
    },
    'field_4769c978-0dbc-4765-b317-d33d286ef38e': {
      type: 'string',
      parentId: 'section_6680fa39-f1e5-4fd0-94c9-78c3e89becea',
      minLength: 0,
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
      allowAttachments: false,
    },
    'field_d46230b1-0748-4bee-b3e6-0171743469be': {
      type: 'string',
      parentId: 'section_e51c6ecb-265b-4345-bf31-578037d4fd2a',
      minLength: 0,
      isCustomisable: true,
      allowAttachments: false,
    },
    'field_e17091a6-aade-40dd-852b-0df99be796f0': {
      type: 'string',
      parentId: 'section_6680fa39-f1e5-4fd0-94c9-78c3e89becea',
      minLength: 0,
      isCustomisable: true,
      allowAttachments: false,
    },
    'field_7eeb4750-24c3-4b1a-87a8-47eb6f05e051': {
      type: 'array',
      parentId: 'section_6680fa39-f1e5-4fd0-94c9-78c3e89becea',
      isCustomisable: true,
      minItems: 0,
      uniqueItems: true,
      allowAttachments: false,
      items: {
        oneOf: [
          {
            const: 'f8cd8cd4-c122-4564-9c4b-5300d447e9e4',
            title: 'A',
          },
          {
            const: '12b76496-672e-48dd-b14a-babb048cb0b9',
            title: 'B',
          },
          {
            const: '48bfdc6f-6f93-44bf-9d19-a003b5fe86cc',
            title: 'C',
          },
        ],
      },
    },
  },
};

export const uiSchema = {
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
            fieldType: 'text',
            placeholder: '',
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
          id: 'field_7eeb4750-24c3-4b1a-87a8-47eb6f05e051',
          type: 'Control',
          label: 'This is a MULTISELECT field',
          parentId: 'section_6680fa39-f1e5-4fd0-94c9-78c3e89becea',
          scope: '#/properties/field_7eeb4750-24c3-4b1a-87a8-47eb6f05e051',
          options: {
            placeholder: '',
            fieldType: 'multiselect',
          },
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
      ],
    },
  ],
};

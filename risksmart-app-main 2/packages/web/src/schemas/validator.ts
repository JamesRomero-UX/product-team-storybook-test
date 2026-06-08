// @ts-nocheck
import Ajv from 'ajv';

const ajv = new Ajv();

interface BandedRating {
  label: string;
  value: number;
  range: [number, number];
  color: string;
}

interface FixedRating {
  label: string;
  value: number;
  color: string;
}

type Rating = BandedRating | FixedRating;

const schema: JSONSchemaType<Rating> = {
  type: 'object',
  properties: {
    label: { type: 'string' },
    value: { type: 'integer' },
    range: {
      type: 'array',
      items: [{ type: 'integer' }, { type: 'integer' }],
      minItems: 2,
      maxItems: 2,
    },
    color: { type: 'string', format: 'color' },
  },
  required: ['label', 'value', 'range', 'color'],
  additionalProperties: false,
};

// validate is a type guard for MyData - type is inferred from schema type
const validate = ajv.compile(schema);

// or, if you did not use type annotation for the schema,
// type parameter can be used to make it type guard:
// const validate = ajv.compile<MyData>(schema)

const data = {
  foo: 1,
  bar: 'abc',
};

if (validate(data)) {
  // data is MyData here

  console.log(data.foo);
} else {
  console.log(validate.errors);
}

import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';

export const validator = new Ajv({
  allErrors: true,
  strict: false,
  useDefaults: false,
});

ajvErrors(validator, { singleError: true });

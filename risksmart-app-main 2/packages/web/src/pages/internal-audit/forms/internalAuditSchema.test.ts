import type { InternalAuditFormDataFields } from './internalAuditSchema';
import { InternalAuditFormSchema } from './internalAuditSchema';

const internalAudit: InternalAuditFormDataFields = {
  Owners: [
    {
      value: 'Owner',
      type: 'user',
    },
  ],
  Title: 'Title',
  Description: 'Description',
  BusinessArea: 'Business bits',
  Contributors: [],
  tags: [],
  departments: [],
  ancestorContributors: [],
};

describe('InternalAudits Schema', () => {
  test('Internal Audit parses valid schema correctly', () => {
    const input = {
      ...internalAudit,
    };
    expect(InternalAuditFormSchema.parse(input)).toStrictEqual(input);
    expect(() =>
      InternalAuditFormSchema.parse({
        ...input,
      })
    ).not.toThrow();
  });
  test('Internal Audit must have a title', () => {
    const input = {
      ...internalAudit,
      Title: undefined,
    };
    expect(() =>
      InternalAuditFormSchema.parse({
        ...input,
      })
    ).toThrow();
  });

  test('Internal Audit must have a business area', () => {
    const input = {
      ...internalAudit,
      BusinessArea: undefined,
    };
    expect(() =>
      InternalAuditFormSchema.parse({
        ...input,
      })
    ).toThrow();
  });

  test('Internal Audit must have at least 1 owner', () => {
    const input = {
      ...internalAudit,
      Owners: [],
    };
    expect(() =>
      InternalAuditFormSchema.parse({
        ...input,
      })
    ).toThrow();
  });
});

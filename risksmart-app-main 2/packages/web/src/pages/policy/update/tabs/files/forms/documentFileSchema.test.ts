import {
  Document_File_Type_Enum,
  Version_Status_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { DocumentVersionFormFieldData } from './documentFileSchema';
import { DocumentFileFormSchema } from './documentFileSchema';

const validInput: DocumentVersionFormFieldData = {
  Version: '1',
  Summary: null,
  Status: Version_Status_Enum.Archived,
  ReasonForReview: null,
  ReviewedBy: null,
  ReviewDate: null,
  NextReviewDate: null,
  Link: 'http://www.google.com',
  Type: Document_File_Type_Enum.Link,
};

describe('DocumentFileFormSchema', () => {
  it('should parse valid input', () => {
    expect(DocumentFileFormSchema.parse(validInput)).toStrictEqual(validInput);
  });

  it('should be valid when Type = Html and link is invalid, and Link not returned', () => {
    const { Link: _Link, ...rest } = validInput;
    const input: DocumentVersionFormFieldData = {
      ...rest,
      Type: Document_File_Type_Enum.Html,
      Content: '<p>hello</p>',
    };
    expect(
      DocumentFileFormSchema.parse({ ...input, Link: 'Invalid' })
    ).toStrictEqual(input);
  });

  it('should be valid when Type = Link and Content is set, and Content not returned', () => {
    expect(
      DocumentFileFormSchema.parse({ ...validInput, Content: '<p>hello</p>' })
    ).toStrictEqual(validInput);
  });

  it('should be invalid if Type = Link and link not set', () => {
    const input = {
      ...validInput,
      Link: null,
    };
    expect(DocumentFileFormSchema.safeParse(input).success).toEqual(false);
  });

  it('should be invalid if Type = Html and Content not set', () => {
    const { Link: _link, ...rest } = validInput;
    const input = {
      ...rest,
      Type: Document_File_Type_Enum.Html,
    };
    expect(DocumentFileFormSchema.safeParse(input).success).toEqual(false);
  });
});

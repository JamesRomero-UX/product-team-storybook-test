import { Indicator_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import { getResult } from './config';

describe('config', () => {
  describe('getResult', () => {
    it('should return - if type is boolean', () => {
      const result = getResult({
        parent: {
          Type: Indicator_Type_Enum.Boolean,
        },
      });
      expect(result).toEqual('-');
    });

    it('should return TargetValueTxt value if type is text', () => {
      const result = getResult({
        TargetValueTxt: 'hello',
        parent: {
          Type: Indicator_Type_Enum.Text,
        },
      });
      expect(result).toEqual('hello');
    });

    it('should return TargetValueNum value (as string) if type is number', () => {
      const result = getResult({
        TargetValueNum: 2,
        parent: {
          Type: Indicator_Type_Enum.Number,
        },
      });
      expect(result).toEqual('2');
    });

    it('should return TargetValueNum value (when 0) if type is number', () => {
      const result = getResult({
        TargetValueNum: 0,
        parent: {
          Type: Indicator_Type_Enum.Number,
        },
      });
      expect(result).toEqual('0');
    });
  });
});

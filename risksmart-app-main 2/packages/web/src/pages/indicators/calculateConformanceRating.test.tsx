import {
  calculatePercentageDifference,
  conformanceIndicatorRating,
  getConformanceTrendRating,
} from './calculateConformanceRating';
import { ConformanceIndicatorRating, ConformanceTrend } from './types';

describe('calculateConformanceRating', () => {
  describe('getConformanceTrendRating', () => {
    it('should return null if there are no results', () => {
      const result = getConformanceTrendRating(
        {
          UpperToleranceNum: 10,
          LowerToleranceNum: 0,
        },
        []
      );
      expect(result).toEqual(null);
    });

    it('should return null if there is no previous result', () => {
      const result = getConformanceTrendRating(
        {
          UpperToleranceNum: 10,
          LowerToleranceNum: 0,
        },
        [{ TargetValueNum: 1 }]
      );
      expect(result).toEqual(null);
    });

    it('should return improving when result moves from Outside to Within', () => {
      const result = getConformanceTrendRating(
        {
          UpperToleranceNum: 6,
          LowerToleranceNum: 4,
        },
        [
          {
            TargetValueNum: 5,
          },
          {
            TargetValueNum: 3,
          },
        ]
      );
      expect(result).toEqual(ConformanceTrend.Improving);
    });

    it('should return deteriorating when result moves from Within to OutsideAppetite', () => {
      const result = getConformanceTrendRating(
        {
          UpperToleranceNum: 6,
          UpperAppetiteNum: 4,
        },
        [
          {
            TargetValueNum: 5,
          },
          {
            TargetValueNum: 3,
          },
        ]
      );
      expect(result).toEqual(ConformanceTrend.Deteriorating);
    });

    it('should return deteriorating when result moves from Within to Outside', () => {
      const result = getConformanceTrendRating(
        {
          UpperToleranceNum: 6,
          LowerToleranceNum: 4,
        },
        [
          {
            TargetValueNum: 3,
          },
          {
            TargetValueNum: 5,
          },
        ]
      );
      expect(result).toEqual(ConformanceTrend.Deteriorating);
    });

    it('should return improving when result moves from OutsideAppetite to Within', () => {
      const result = getConformanceTrendRating(
        {
          UpperToleranceNum: 6,
          UpperAppetiteNum: 4,
        },
        [
          {
            TargetValueNum: 3,
          },
          {
            TargetValueNum: 5,
          },
        ]
      );
      expect(result).toEqual(ConformanceTrend.Improving);
    });
  });

  describe('conformanceIndicatorRating', () => {
    it("should return 'Within' if the value falls within upper and lower tolerance", () => {
      const result = conformanceIndicatorRating(
        {
          UpperToleranceNum: 10,
          LowerToleranceNum: 0,
        },
        { TargetValueNum: 5 }
      );
      expect(result).toEqual(ConformanceIndicatorRating.Within);
    });

    it("should return 'Outside' if the value falls outside upper and lower tolerance", () => {
      const result = conformanceIndicatorRating(
        {
          UpperToleranceNum: 10,
          LowerToleranceNum: 0,
        },
        { TargetValueNum: 11 }
      );
      expect(result).toEqual(ConformanceIndicatorRating.Outside);
    });

    it("should return 'Within' if the value falls within upper and lower appetite", () => {
      const result = conformanceIndicatorRating(
        {
          UpperAppetiteNum: 10,
          LowerAppetiteNum: 0,
        },
        { TargetValueNum: 5 }
      );
      expect(result).toEqual(ConformanceIndicatorRating.Within);
    });

    it("should return 'Within' if the value falls within upper and lower appetite and tolerance", () => {
      const result = conformanceIndicatorRating(
        {
          UpperToleranceNum: 20,
          UpperAppetiteNum: 10,
          LowerAppetiteNum: 1,
          LowerToleranceNum: 0,
        },
        { TargetValueNum: 5 }
      );
      expect(result).toEqual(ConformanceIndicatorRating.Within);
    });

    it("should return 'OutsideAppetite' if the value falls outside upper and lower appetite and no tolerance set", () => {
      const result = conformanceIndicatorRating(
        {
          UpperAppetiteNum: 10,
          LowerAppetiteNum: 0,
        },
        { TargetValueNum: 11 }
      );
      expect(result).toEqual(ConformanceIndicatorRating.OutsideAppetite);
    });
  });

  describe('calculatePercentageDifference', () => {
    it('should return "0%" if values are equal', () => {
      const result = calculatePercentageDifference(1, 1);

      expect(result).toEqual('0%');
    });

    it('should return "+100%" if current value is 0 and previous value is a negative number other than 0', () => {
      const result = calculatePercentageDifference(0, -3);

      expect(result).toEqual('+100%');
    });

    it('should return "-100%" if current value is 0 and previous value is a positive number other than 0', () => {
      const result = calculatePercentageDifference(0, 3);

      expect(result).toEqual('-100%');
    });

    it('should return "-" if current value is NOT 0 and previous value is 0', () => {
      const result = calculatePercentageDifference(-3, 0);

      expect(result).toEqual('-');
    });

    it('should return correct result if going from a positive to a negative value', () => {
      const result = calculatePercentageDifference(-2, 1);

      expect(result).toEqual('-300%');
    });

    it('should return correct result if going from a negative to a positive value', () => {
      const result = calculatePercentageDifference(1, -2);

      expect(result).toEqual('+150%');
    });

    it('should return positive result if difference is positive', () => {
      const result = calculatePercentageDifference(2, 1);

      expect(result).toEqual('+100%');
    });

    it('should return negative result if difference is negative', () => {
      const result = calculatePercentageDifference(1, 2);

      expect(result).toEqual('-50%');
    });
  });
});

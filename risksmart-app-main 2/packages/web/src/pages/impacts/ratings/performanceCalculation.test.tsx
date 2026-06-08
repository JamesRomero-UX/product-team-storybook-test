import {
  getImpactPerformanceScore,
  getLikelihoodPerformanceScore,
  getPerformanceRating,
  ImpactPerformanceRating,
} from './performanceCalculation';

describe('performanceCalculation', () => {
  describe('getPerformanceRating', () => {
    it.each([
      {
        performanceScore: 1,
        expectedResult: ImpactPerformanceRating.Above,
      },
      {
        performanceScore: 0,
        expectedResult: ImpactPerformanceRating.Aligned,
      },
      {
        performanceScore: -1,
        expectedResult: ImpactPerformanceRating.Below,
      },
      {
        performanceScore: null,
        expectedResult: null,
      },
    ])(
      'should return $expectedResult for a performance score of $performanceScore',
      ({ performanceScore, expectedResult }) => {
        const result = getPerformanceRating(performanceScore);
        expect(result).toEqual(expectedResult);
      }
    );
  });

  describe('getImpactPerformanceScore', () => [
    it.each([
      {
        ImpactAppetite: 2,
        Rating: 3,
        expectedResult: -1,
      },
      {
        ImpactAppetite: 5,
        Rating: 1,
        expectedResult: 4,
      },
      {
        ImpactAppetite: null,
        Rating: 1,
        expectedResult: null,
      },
    ])(
      'should return appetite ($ImpactAppetite) - rating ($Rating) = $expectedResult',
      ({ ImpactAppetite, Rating, expectedResult }) => {
        const result = getImpactPerformanceScore(Rating, ImpactAppetite);
        expect(result).toEqual(expectedResult);
      }
    ),
  ]);

  describe('getLikelihoodPerformanceScore', () => [
    it.each([
      {
        LikelihoodAppetite: 2,
        Likelihood: 3,
        expectedResult: -1,
      },
      {
        LikelihoodAppetite: 5,
        Likelihood: 1,
        expectedResult: 4,
      },
      {
        LikelihoodAppetite: null,
        Likelihood: 1,
        expectedResult: null,
      },
      {
        LikelihoodAppetite: 2,
        Likelihood: null,
        expectedResult: null,
      },
    ])(
      'should return appetite ($LikelihoodAppetite) - rating ($Likelihood) = $expectedResult',
      ({ LikelihoodAppetite, Likelihood, expectedResult }) => {
        const result = getLikelihoodPerformanceScore(
          {
            Likelihood,
          },
          LikelihoodAppetite
        );
        expect(result).toEqual(expectedResult);
      }
    ),
  ]);
});

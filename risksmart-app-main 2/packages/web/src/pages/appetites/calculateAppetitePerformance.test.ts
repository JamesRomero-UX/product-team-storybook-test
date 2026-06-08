import {
  APPETITE_PERFORMANCE,
  getAppetitePerformance,
} from './calculateAppetitePerformance';

describe('getAppetitePerformance', () => {
  it.each`
    lower   | upper   | controlledRating | expected
    ${0}    | ${0}    | ${null}          | ${null}
    ${0}    | ${0}    | ${3}             | ${null}
    ${3}    | ${0}    | ${3}             | ${null}
    ${0}    | ${3}    | ${3}             | ${null}
    ${null} | ${null} | ${null}          | ${null}
    ${1}    | ${null} | ${null}          | ${null}
    ${null} | ${1}    | ${null}          | ${null}
    ${1}    | ${3}    | ${null}          | ${null}
    ${1}    | ${3}    | ${5}             | ${APPETITE_PERFORMANCE.OUTSIDE}
    ${3}    | ${4}    | ${2}             | ${APPETITE_PERFORMANCE.OUTSIDE}
    ${1}    | ${3}    | ${2}             | ${APPETITE_PERFORMANCE.INSIDE}
    ${1}    | ${3}    | ${1}             | ${APPETITE_PERFORMANCE.INSIDE}
    ${1}    | ${3}    | ${3}             | ${APPETITE_PERFORMANCE.INSIDE}
  `(
    'should return the correct performance ($expected) for a given appetite [$lower, $upper] and risk rating $controlledRating with useRanges=$useRanges',
    ({ lower, upper, controlledRating, expected }) => {
      // Arrange
      const appetite = {
        LowerAppetite: lower,
        UpperAppetite: upper,
      };

      // Act
      const result = getAppetitePerformance({
        ...appetite,
        posture: false,
        controlledRating,
      });

      // Assert
      expect(result).toBe(expected);
    }
  );
});

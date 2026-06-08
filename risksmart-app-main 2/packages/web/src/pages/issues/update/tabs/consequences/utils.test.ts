import { Cost_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { describe, expect, it } from 'vitest';

import { calculateCostTotal, getCost } from './utils';

describe('consequences utils', () => {
  describe('calculateCostTotal', () => {
    it('should calculate cost totals correctly for normal decimal values', () => {
      const consequences = [
        { CostType: Cost_Type_Enum.Financial, CostValue: 10.5 },
        { CostType: Cost_Type_Enum.Financial, CostValue: 20.25 },
        { CostType: Cost_Type_Enum.Financial, CostValue: 15.75 },
      ];

      const total = calculateCostTotal(consequences, Cost_Type_Enum.Financial);
      expect(total).toBe(46.5);
    });

    it('should handle floating point precision issues', () => {
      const consequences = [
        { CostType: Cost_Type_Enum.Financial, CostValue: 0.1 },
        { CostType: Cost_Type_Enum.Financial, CostValue: 0.2 },
        { CostType: Cost_Type_Enum.Financial, CostValue: 0.3 },
      ];

      const total = calculateCostTotal(consequences, Cost_Type_Enum.Financial);
      expect(total).toBe(0.6);
      expect(total).not.toBe(0.6000000000000001); // Ensures precision issue is fixed
    });

    it('should round to 2 decimal places', () => {
      const consequences = [
        { CostType: Cost_Type_Enum.Financial, CostValue: 1.234567 },
        { CostType: Cost_Type_Enum.Financial, CostValue: 2.345678 },
      ];

      const total = calculateCostTotal(consequences, Cost_Type_Enum.Financial);
      expect(total).toBe(3.58); // 1.234567 + 2.345678 = 3.580245, rounded to 3.58
    });

    it('should filter by cost type correctly', () => {
      const consequences = [
        { CostType: Cost_Type_Enum.Financial, CostValue: 10.5 },
        { CostType: Cost_Type_Enum.Hours, CostValue: 20.25 },
        { CostType: Cost_Type_Enum.Financial, CostValue: 15.75 },
        { CostType: Cost_Type_Enum.CustomersImpacted, CostValue: 100 },
      ];

      const financialTotal = calculateCostTotal(
        consequences,
        Cost_Type_Enum.Financial
      );
      const hoursTotal = calculateCostTotal(consequences, Cost_Type_Enum.Hours);
      const customersTotal = calculateCostTotal(
        consequences,
        Cost_Type_Enum.CustomersImpacted
      );

      expect(financialTotal).toBe(26.25);
      expect(hoursTotal).toBe(20.25);
      expect(customersTotal).toBe(100);
    });

    it('should return 0 for empty array', () => {
      const total = calculateCostTotal([], Cost_Type_Enum.Financial);
      expect(total).toBe(0);
    });

    it('should return 0 when no matching cost type found', () => {
      const consequences = [
        { CostType: Cost_Type_Enum.Hours, CostValue: 10.5 },
      ];

      const total = calculateCostTotal(consequences, Cost_Type_Enum.Financial);
      expect(total).toBe(0);
    });

    it('should handle edge case rounding', () => {
      const consequences = [
        { CostType: Cost_Type_Enum.Financial, CostValue: 1.005 },
        { CostType: Cost_Type_Enum.Financial, CostValue: 1.004 },
      ];

      const total = calculateCostTotal(consequences, Cost_Type_Enum.Financial);
      expect(total).toBe(2.01); // 1.005 + 1.004 = 2.009, rounded to 2.01
    });

    it('should handle very large numbers with proper precision', () => {
      const consequences = [
        { CostType: Cost_Type_Enum.Financial, CostValue: 999999.99 },
        { CostType: Cost_Type_Enum.Financial, CostValue: 0.01 },
      ];

      const total = calculateCostTotal(consequences, Cost_Type_Enum.Financial);
      expect(total).toBe(1000000.0);
    });
  });

  describe('getCost', () => {
    it('should return cost value when cost type matches', () => {
      const consequence = {
        CostType: Cost_Type_Enum.Financial,
        CostValue: 123.45,
      };

      const cost = getCost(consequence, Cost_Type_Enum.Financial);
      expect(cost).toBe(123.45);
    });

    it('should return 0 when cost type does not match', () => {
      const consequence = {
        CostType: Cost_Type_Enum.Hours,
        CostValue: 123.45,
      };

      const cost = getCost(consequence, Cost_Type_Enum.Financial);
      expect(cost).toBe(0);
    });

    it('should handle zero cost value', () => {
      const consequence = {
        CostType: Cost_Type_Enum.Financial,
        CostValue: 0,
      };

      const cost = getCost(consequence, Cost_Type_Enum.Financial);
      expect(cost).toBe(0);
    });
  });
});

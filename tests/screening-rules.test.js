import { describe, expect, test } from 'bun:test';
import { evaluateScreening } from '../src/features/screening/screening-rules';

const allNo = {
  tobacco: 'no',
  lowFruitVegetable: 'no',
  lowPhysicalActivity: 'no',
  alcohol: 'no',
  familyHistory: 'no',
  knownHighBloodPressure: 'no',
  knownHighBloodGlucose: 'no',
  knownHighCholesterol: 'no',
  knownOverweight: 'no',
};

describe('PTM factor checklist', () => {
  test('does not invent a risk score when no factor is reported', () => {
    expect(evaluateScreening(allNo)).toEqual({
      factors: [],
      missingChecks: [],
      status: 'no_factors_reported',
    });
  });

  test('separates reported factors from measurements that are not known', () => {
    expect(evaluateScreening({
      ...allNo,
      tobacco: 'yes',
      familyHistory: 'yes',
      knownHighBloodPressure: 'unknown',
      knownHighCholesterol: 'unknown',
    })).toEqual({
      factors: ['tobacco', 'familyHistory'],
      missingChecks: ['blood_pressure', 'cholesterol'],
      status: 'factors_found',
    });
  });
});

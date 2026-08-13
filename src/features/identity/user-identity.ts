import type { User } from '@/types';
import type { IdentityProfile } from '@/features/lifestyle/types';

export function userHasIdentity(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.identityComplete) return true;
  return (
    user.age != null
    && user.sex != null
    && user.race_ethnicity != null
    && user.education != null
    && user.income_poverty_ratio != null
  );
}

export function userToIdentityProfile(user: User | null | undefined): IdentityProfile | null {
  if (!user || !userHasIdentity(user)) return null;
  const age = Number(user.age);
  const sex = Number(user.sex);
  const race_ethnicity = Number(user.race_ethnicity);
  const education = Number(user.education);
  const income_poverty_ratio = Number(user.income_poverty_ratio);
  if (![age, sex, race_ethnicity, education, income_poverty_ratio].every(Number.isFinite)) {
    return null;
  }
  return {
    age,
    sex,
    race_ethnicity,
    education,
    income_poverty_ratio,
    completedAt: user.identityCompletedAt ?? new Date().toISOString(),
  };
}

export type IdentityInput = {
  age: number;
  sex: number;
  race_ethnicity: number;
  education: number;
  income_poverty_ratio: number;
};

export function identityInputToPayload(input: IdentityInput) {
  return {
    age: input.age,
    sex: input.sex,
    race_ethnicity: input.race_ethnicity,
    education: input.education,
    income_poverty_ratio: input.income_poverty_ratio,
  };
}

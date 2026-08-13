import {
  EDUCATION_OPTIONS, INCOME_OPTIONS, RACE_OPTIONS, SEX_OPTIONS,
} from './options';
import type { IdentityProfile } from './types';

function optionLabel(
  options: { value: number; label: string }[],
  value: number | null | undefined,
): string {
  if (value == null) return '-';
  return options.find((item) => item.value === value)?.label ?? String(value);
}

export type IdentityDisplayRow = {
  key: keyof IdentityProfile;
  label: string;
  value: string;
};

export function formatIdentityRows(identity: IdentityProfile | null): IdentityDisplayRow[] {
  if (!identity) return [];

  return [
    { key: 'age', label: 'Usia', value: `${identity.age} tahun` },
    { key: 'sex', label: 'Jenis kelamin', value: optionLabel(SEX_OPTIONS, identity.sex) },
    {
      key: 'race_ethnicity',
      label: 'Latar belakang',
      value: optionLabel(RACE_OPTIONS, identity.race_ethnicity),
    },
    { key: 'education', label: 'Pendidikan', value: optionLabel(EDUCATION_OPTIONS, identity.education) },
    {
      key: 'income_poverty_ratio',
      label: 'Kondisi ekonomi',
      value: optionLabel(INCOME_OPTIONS, identity.income_poverty_ratio),
    },
  ];
}

export function formatIdentityUpdatedAt(iso: string | undefined): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

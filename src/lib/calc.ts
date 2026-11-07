/** Time calculator model. Edit defaults and ranges here. */

export const WEEKS_PER_YEAR = 46; // 52 weeks less holidays and vacation
export const HOURS_PER_WEEK = 40;
export const FTE_HOURS = HOURS_PER_WEEK * WEEKS_PER_YEAR;

export type InputDef = {
  key: 'people' | 'hours' | 'rate';
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  value: number;
  format: 'int' | 'hours' | 'money';
};

export const inputs: InputDef[] = [
  {
    key: 'people',
    label: 'People on your team',
    hint: 'Who spend part of their week on manual, repetitive work',
    min: 1,
    max: 100,
    step: 1,
    value: 12,
    format: 'int',
  },
  {
    key: 'hours',
    label: 'Hours each on repetitive tasks / week',
    hint: 'Data entry, copying between systems, reports, chasing',
    min: 1,
    max: 30,
    step: 1,
    value: 8,
    format: 'hours',
  },
  {
    key: 'rate',
    label: 'Cost of an hour of their time',
    hint: 'Pay plus benefits',
    min: 20,
    max: 150,
    step: 5,
    value: 50,
    format: 'money',
  },
];

export type Values = Record<InputDef['key'], number>;

export function compute(v: Values) {
  const hours = v.people * v.hours * WEEKS_PER_YEAR;
  const cost = hours * v.rate;
  const fte = hours / FTE_HOURS;
  const daysPerWeek = v.hours / 8; // per person
  const weekShare = v.hours / HOURS_PER_WEEK;
  return { hours, cost, fte, daysPerWeek, weekShare };
}

/** "1 full day", "half a day", "1.5 days", "6 hours" */
export function describeDays(hours: number): string {
  const d = hours / 8;
  if (hours < 4) return `${hours} hour${hours === 1 ? '' : 's'}`;
  if (hours === 4) return 'half a day';
  if (hours === 8) return '1 full day';
  if (Number.isInteger(d)) return `${d} full days`;
  return `${(Math.round(d * 10) / 10).toLocaleString('en-CA')} days`;
}

/** How many person icons to draw, and how many people each one stands for. */
export function iconScale(people: number) {
  const max = 30;
  if (people <= max) return { icons: people, per: 1 };
  const per = Math.ceil(people / max);
  return { icons: Math.ceil(people / per), per };
}

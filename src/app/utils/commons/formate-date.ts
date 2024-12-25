import dayjs from 'dayjs';
import { DateTime, DurationLike } from 'luxon';

export const subtractYears = (numOfYears: number, date: Date) => {
  const dateSub = new Date(date.getTime());
  dateSub.setFullYear(dateSub.getFullYear() - numOfYears);
  return dateSub;
};

export const formatYYMMDDDate = (date: Date) => {
  return DateTime.fromJSDate(date).toFormat('yyyy/LL/dd');
};

export const formatDDMMYYDate = (date: Date) =>
  DateTime.fromJSDate(date).toFormat('dd/MM/yyyy');

export const formatHHmmDate = (date: Date) =>
  DateTime.fromJSDate(date).toFormat('HH:mm');

export const getDayOfMonth = (date: Date) => {
  return dayjs(date).date();
};

export const formatNowDateYYMMDD = (date: Date) =>
  DateTime.fromJSDate(date).toFormat('yyyyLLdd');

export const dateTimeNowUtc = () => DateTime.utc().toJSDate();

export const addMinutesToDateTimeNowUtc = (minutes: number) =>
  DateTime.utc().plus({ minutes: minutes }).toJSDate();

export const stringDateFormateYYMMDDUtc = (date: string) => {
  return DateTime.fromFormat(date, 'dd/MM/yyyy').toISO() as unknown as Date;
};

export const addDaysToTimeNowUtcDate = (dayNumber: number) => {
  return DateTime.utc().plus({ days: dayNumber }).toJSDate();
};

export const addMonthsToTimeNowUtcDate = (dayNumber: number) => {
  return DateTime.utc().plus({ months: dayNumber }).toJSDate();
};

export const addDaysToTimeNowUtcUnixInteger = (dayNumber: number) => {
  return DateTime.utc().plus({ days: dayNumber }).toUnixInteger();
};

export const addDaysToDateUtcUnixInteger = (options: {
  date: Date;
  dayNumber: number;
}) => {
  const { date, dayNumber } = options;
  const dateFormate = String(DateTime.fromJSDate(date));
  return DateTime.fromISO(dateFormate)
    .plus({ days: dayNumber })
    .toUnixInteger();
};

export const addMonthsFormateDDMMYYDate = (options: {
  date: Date;
  monthNumber: number;
}) => {
  const { date, monthNumber } = options;
  const dateFormate = String(DateTime.fromJSDate(date));
  return DateTime.fromISO(dateFormate).plus({ months: monthNumber }).toJSDate();
};

export const addYearsFormateDDMMYYDate = (options: {
  date: Date;
  yearNumber: number;
}) => {
  const { date, yearNumber } = options;
  const dateFormate = String(DateTime.fromJSDate(date));
  return DateTime.fromISO(dateFormate).plus({ years: yearNumber }).toJSDate();
};

export const substrateDaysToTimeNowUtcDate = (value: number) => {
  return DateTime.utc().minus({ days: value }).toJSDate();
};

export const substrateDaysToTimeNowUtcUnixInteger = (value: number) => {
  return DateTime.utc().minus({ days: value }).toUnixInteger();
};

export const formateNowDateUnixInteger = (date: Date) => {
  return DateTime.fromJSDate(date).toUnixInteger() as unknown as number;
};
export const fromIsoToYYYYMMDD = (date: Date) => {
  return DateTime.fromISO(date as unknown as string).toFormat('yyyy/LL/dd');
};

export const dateTimeNowUtcUnixInteger = () =>
  DateTime.fromISO(DateTime.utc().toISO() as string).toUnixInteger();

export const formatDateToUtc = (date: string) => {
  return DateTime.fromFormat(date, 'yyyy-mm-dd').toISO() as unknown as Date;
};

export const formatDateJsToUtc = (date: Date) => {
  return DateTime.fromJSDate(date).toUTC().toJSDate();
};

export const formatDateDifference = (date: Date) => {
  const birthDate = DateTime.fromJSDate(date);
  const now = DateTime.now();
  const days = Math.floor(now.diff(birthDate, 'days').days);
  const years = Math.floor(now.diff(birthDate, 'years').years);
  const months = Math.floor(now.diff(birthDate, 'months').months);

  //const age = years >= 1 ? `${years} years` : `${months} mths`;
  let age = '';
  if (years > 1) {
    age = `${years} years`;
  }
  if (months >= 1 && years < 1) {
    age = `${months} mnths`;
  }
  if (days < 32 && months < 1 && years < 1) {
    age = `${days} days`;
  }

  return age;
};

export const addToDateUtc = ({
  date,
  plus,
}: {
  date: Date;
  plus: DurationLike;
}) => {
  return DateTime.fromISO(DateTime.fromJSDate(date).toString())
    .plus(plus)
    .toUTC()
    .toJSDate();
};

const timeMult = { days: 86_400, hrs: 3_600, min: 60, sec: 1 };
type OffsetUnit = keyof typeof timeMult;

/** Create a UTC `Date` from current time + *optional* offset */
export const timeNowUTC = (offset: number = 0, from: OffsetUnit = 'sec') =>
  DateTime.utc()
    .plus({ seconds: offset * timeMult[from] })
    .toJSDate();

export const timeMinusNowUTC = (offset: number = 0, from: OffsetUnit = 'sec') =>
  DateTime.utc()
    .minus({ seconds: offset * timeMult[from] })
    .toJSDate();

export const lastDayMonth = ({
  year,
  month,
}: {
  year: number;
  month: number;
}) => {
  return new Date(Number(year), Number(month), 1);
};

export const formateMMNumericDate = (date: Date) => {
  return DateTime.fromJSDate(date).toLocaleString({ month: 'numeric' });
};

export const formateDDNumericDate = (date: Date) => {
  return DateTime.fromJSDate(date).toLocaleString({ day: 'numeric' });
};

export const formateYYYYDate = (date: Date) => {
  return DateTime.fromJSDate(date).toLocaleString({ year: 'numeric' });
};

export const formateDDDate = (date: Date, lang: string) => {
  return DateTime.fromJSDate(date).setLocale(lang).toFormat('dd LLL');
};

export const formateMMDate = (date: Date, lang: string) => {
  return DateTime.fromJSDate(date)
    .setLocale(lang)
    .toLocaleString({ month: 'long' });
};
export const formatWeight = (weight: number) => {
  if (weight < 1000) {
    return `${weight}g`;
  }
  if (weight >= 1000) {
    return `${(weight / 1000).toFixed(1)}kg`;
  }
};

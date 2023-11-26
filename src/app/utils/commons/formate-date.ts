import { DateTime, DurationLike } from 'luxon';

export const subtractYears = (numOfYears: number, date: Date) => {
  const dateSub = new Date(date.getTime());
  dateSub.setFullYear(dateSub.getFullYear() - numOfYears);
  return dateSub;
};

export const formateYYMMDDDate = (date: Date) => {
  return DateTime.fromJSDate(date).toFormat('yyyy/LL/dd');
};

export const formateDDMMYYDate = (date: Date) =>
  DateTime.fromJSDate(date).toFormat('dd/MM/yyyy');

export const formateHHmmDate = (date: Date) =>
  DateTime.fromJSDate(date).toFormat('HH:mm');

export const formateNowDateYYMMDD = (date: Date) =>
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

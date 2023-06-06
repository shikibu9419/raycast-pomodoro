import dayjs, { Dayjs } from "dayjs";
import duration from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(duration);
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.tz.setDefault("Asia/Tokyo");

// all day = 0:00:00
export const isAllDay = (target?: Dayjs) => target && !target.second() && !target.minute() && !target.hour();

// same day
export const isSameDate = (target?: Dayjs, base = dayjs()) => {
  return target && target.date() === base.date() && target.month() === base.month() && target.year() === base.year();
};

// More than 1 day and less than 3 days after the due date
export const isIncoming = (target?: Dayjs, base = dayjs(), ignoreSameday = false) => {
  if (!target || (ignoreSameday && isSameDate(target, base))) return false;

  const unixTimeDiff = target.unix() - base.unix();

  return 0 <= unixTimeDiff && unixTimeDiff < 60 * 60 * 24 * 3;
};

// expired
export const isExpired = (target?: Dayjs, base = dayjs()) =>
  target && !(isSameDate(target, base) && isAllDay(target)) && target.unix() - base.unix() < 0;

// YYYY-MM-DDTHH:mm:ssZ (without milliseconds)
export const dateToString = (date: Dayjs): string => date.format();

export const getToday = () => dayjs().second(0).minute(0).hour(0);

export const getTomorrow = (date?: Dayjs) => dayjs((date || getToday()).unix() + 1000 * 60 * 60 * 24);

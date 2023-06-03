// all day = 0:00:00
export const isAllDay = (target?: Date) =>
  target && !target.getSeconds() && !target.getMinutes() && !target.getUTCHours();

// same day
export const isSameDate = (target?: Date, base = new Date()) => {
  return (
    target &&
    target.getDate() === base.getDate() &&
    target.getMonth() === base.getMonth() &&
    target.getFullYear() === base.getFullYear()
  );
};

// More than 1 day and less than 3 days after the due date
export const isIncoming = (target?: Date, base = new Date(), ignoreSameday = false) => {
  if (!target || (ignoreSameday && isSameDate(target, base))) return false;

  const unixTimeDiff = (target.getTime() - base.getTime()) / 1000;

  return 0 <= unixTimeDiff && unixTimeDiff < 60 * 60 * 24 * 3;
};

// expired
export const isExpired = (target?: Date, base = new Date()) =>
  target && !(isSameDate(target, base) && isAllDay(target)) && target.getTime() - base.getTime() < 0;
